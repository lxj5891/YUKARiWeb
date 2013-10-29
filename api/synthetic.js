/**
 * Created with JetBrains WebStorm.
 * User: Antony
 * Date: 13-8-21
 * Time: 下午7:36
 * To change this template use File | Settings | File Templates.
 */

var json      = require("smartcore").core.json
  , errors    = require("smartcore").core.errors
  , utils     = require('../core/utils')
  , synthetic = require('../controllers/ctrl_synthetic');

exports.editSynthetic = function(req_,res_){


}
exports.getStoreById = function(req_,res_){
  var synthetic_id = req_.body.synthetic_id;
  var code = req_.session.user.companycode;
  var user = req_.session.user;
  if(!canView(user)){
    return noAccessResponse(res_);
  }
  //console.log("synthetic_id :%s",synthetic_id);
  if(synthetic_id){
    //console.log("success");
    synthetic.getSyntheticById(code, synthetic_id,function(err,result){
      return res_.send(json.dataSchema({items:result}));
    });
  }else{
    return res_.send(json.dataSchema('0'));
  }
};
exports.saveDescription = function(req_,res_){
  var company = req_.session.user.companyid
    , uid = req_.session.user._id;
  var synthetic_id = req_.body.synthetic_id;
  var code = req_.session.user.companycode;
  var comment = req_.body.comment;
  var name = req_.body.name;
  var user = req_.session.user;
  if(!canUpdate(user)){
    return noUpdateResponse(res_);
  }
  synthetic.saveNameAndComment(code, synthetic_id,name,comment,uid, function(err,result){
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema({items: result}));
    }
  });
};
exports.saveAll = function(req_,res_){

  var company = req_.session.user.companyid
    , uid = req_.session.user._id
    , user = req_.session.user;
  var code = req_.session.user.companycode;
  var synthetic_id = req_.body.synthetic_id;
  var cover = req_.body.cover;
  var metadata = req_.body.metadata;
  var coverrows = req_.body.coverrows;
  var covercols = req_.body.covercols;
  var syntheticName = req_.body.syntheticName;
  var syntheticComment = req_.body.syntheticComment;
  var syntheticSign = req_.body.syntheticSign;
  var syntheticOptions = req_.body.options;
  if(!canUpdate(user)){
    return noUpdateResponse(res_);
  }

  synthetic.saveThumbAndMatedata(code, synthetic_id,cover,metadata,coverrows,covercols,syntheticName,syntheticComment, syntheticSign ,syntheticOptions,user, function(err,result){
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema({items: result}));
    }
  });
};
exports.save = function (req_, res_) {

  var company = req_.session.user.companyid
    , uid = req_.session.user._id;
  var code = req_.session.user.companycode;
  var user = req_.session.user;
  if(!canUpdate(user)){
    return noUpdateResponse(res_);
  }

  synthetic.save(code, company, uid, req_.body, function (err, result) {
    console.log(result);
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema({items: result}));
    }
  });
}

// 获取一览
exports.list = function(req_, res_) {

  var company = req_.session.user.companyid
    , code = req_.session.user.companycode
    , start = req_.query.start
    , limit = req_.query.count
    , keyword = req_.query.keyword
    , type = req_.query.type;
  var user = req_.session.user;
  if(!canView(user)){
    return noAccessResponse(res_);
  }

  synthetic.list(code, keyword,type,company, start, limit, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

// 删除
exports.remove = function(req_, res_) {

  var uid = req_.session.user._id
    , syntheticId = req_.body.id
    , code = req_.session.user.companycode;

  var user = req_.session.user;
  if(!canUpdate(user)){
    return noUpdateResponse(res_);
  }

  synthetic.remove(code, uid, syntheticId, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

// 获取一览
exports.copy = function(req_, res_) {

  var syntheticId = req_.body.id
    , code = req_.session.user.companycode
    , uid = req_.session.user._id;

  var user = req_.session.user;
  if(!canUpdate(user)){
    return noUpdateResponse(res_);
  }

  synthetic.copy(code, uid, syntheticId, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};


// author check

// 元素的增删改查都只有content作成者有权限，增删改查暂用一个check
function canUpdate(user_){
  return utils.hasContentPermit(user_);
}

function canView(user_) {
  return utils.hasContentPermit(user_) || utils.hasApprovePermit(user_);
}

function noAccessResponse(res_){
  var err= new errors.Forbidden(__("js.common.access.check"));
  return res_.send(err.code, json.errorSchema(err.code, err.message));
}

function noUpdateResponse(res_){
  var err= new errors.Forbidden(__("js.common.update.check"));
  return res_.send(err.code, json.errorSchema(err.code, err.message));
}