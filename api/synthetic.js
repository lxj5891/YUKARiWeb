/**
 * Created with JetBrains WebStorm.
 * User: Antony
 * Date: 13-8-21
 * Time: 下午7:36
 * To change this template use File | Settings | File Templates.
 */

var json = lib.core.json
  , synthetic = require('../controllers/ctrl_synthetic');

exports.editSynthetic = function(req_,res_){


}
exports.getStoreById = function(req_,res_){
  var synthetic_id = req_.body.synthetic_id;
  //console.log("synthetic_id :%s",synthetic_id);
  if(synthetic_id){
    //console.log("success");
    synthetic.getSyntheticById(synthetic_id,function(err,result){
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
  var comment = req_.body.comment;
  var name = req_.body.name;
  synthetic.saveNameAndComment(synthetic_id,name,comment,uid, function(err,result){
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
  var synthetic_id = req_.body.synthetic_id;
  var cover = req_.body.cover;
  var metadata = req_.body.metadata;
  var coverrows = req_.body.coverrows;
  var covercols = req_.body.covercols;
  var syntheticName = req_.body.syntheticName;
  var syntheticComment = req_.body.syntheticComment;

  synthetic.saveThumbAndMatedata(synthetic_id,cover,metadata,coverrows,covercols,syntheticName,syntheticComment,user, function(err,result){
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

  synthetic.save(company, uid, req_.body, function (err, result) {
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
    , start = req_.query.start
    , limit = req_.query.count
    , type = req_.query.type;

  synthetic.list(type,company, start, limit, function(err, result) {
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

  synthetic.remove(uid, syntheticId, function(err, result) {
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
    , uid = req_.session.user._id;

  synthetic.copy(uid, syntheticId, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};
