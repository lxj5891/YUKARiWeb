var json      = smart.framework.response
  , errors    = smart.framework.errors
  , utils       = require('../core/utils')
  , workstation = require('../controllers/ctrl_workstation');

exports.update = function(req_, res_){

  if(!canUpdate(req_.session.user)){
    return noUpdateResponse(res_);
  }

  var uid = req_.session.user._id;
  var code = req_.session.user.companycode;

  var workstation_ = req_.body;

  workstation.save(code, uid, workstation_, function(err, result){
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

exports.updateList = function(req_, res_){

  if(!canUpdate(req_.session.user)){
    return noUpdateResponse(res_);
  }
  var uid = req_.session.user._id;
  var code = req_.session.user.companycode;

  var workstationList_ = req_.body;

  workstation.saveList(code, uid, workstationList_, function(err, result){
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

exports.list = function(req_, res_) {

  var code = req_.session.user.companycode
    , user = req_.session.user;

  workstation.list(code, user, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

exports.findOne = function(req_, res_){
  var code = req_.session.user.companycode
    , user = req_.session.user
    , workstationId = req_.query.id;

  workstation.get(code, user, workstationId, function(err, result){
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

exports.remove = function(req_, res_) {

  if(!canUpdate(req_.session.user)){
    return noUpdateResponse(res_);
  }
  var code = req_.session.user.companycode
    , uid = req_.session.user._id
    , workstationId = req_.body.id;

  workstation.remove(code, uid, workstationId, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

function canUpdate(user_){
  return utils.hasContentPermit(user_) || utils.isAdmin(user_);
}

function noUpdateResponse(res_){
  var err= new errors.Forbidden(__("js.common.update.check"));
  return res_.send(err.code, json.errorSchema(err.code, err.message));
}

