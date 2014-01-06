var json      = smart.framework.response
  , errors    = smart.framework.errors
  ,response   =smart.framework.response
  , context   = smart.framework.context
  , utils       = require('../core/utils')
  , workstation = require('../controllers/ctrl_workstation');

exports.update = function(req_, res_){

  var handler=new context().bind(req_, res_);

  if(!canUpdate(req_.session.user)){
    return noUpdateResponse(res_);
  }

  workstation.save(handler, function(err, result){
    response.send(res_, err, result);
  });
};

exports.updateList = function(req_, res_){

  var handler=new context().bind(req_, res_);

  if(!canUpdate(req_.session.user)){
    return noUpdateResponse(res_);
  }


  workstation.saveList(handler, function(err, result){
    response.send(res_, err, result);
  });
};

exports.list = function(req_, res_) {

  var handler = new context().bind(req_,res_);

  workstation.list(handler, function(err, result) {
    response.send(res_, err, result);
  });
};

exports.findOne = function(req_, res_){

  var handler=new context().bind(req_, res_);

  workstation.get(handler, function(err, result){
    response.send(res_, err, result);
  });
};

exports.remove = function(req_, res_) {

  var handler = new context().bind(req_,res_);

  if(!canUpdate(req_.session.user)){
    return noUpdateResponse(res_);
  }


  workstation.remove(handler, function(err, result) {
    response.send(res_, err, result);
  });
};

function canUpdate(user_){
  return utils.hasContentPermit(user_) || utils.isAdmin(user_);
}

function noUpdateResponse(res_){
  var err= new errors.Forbidden(__("js.common.update.check"));
  return res_.send(err.code, json.errorSchema(err.code, err.message));
}

