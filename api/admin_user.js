var json      = smart.framework.response
  , errors    = smart.framework.errors
  , adminuser = require('../controllers/ctrl_admin_user')
  , context   = smart.framework.context
  , response  = smart.framework.response
  , util      = require('../core/utils');

//权限check
function commonCheck(req_, res_) {
  var user =  req_.session.user;
  //DA系统管理员,开发人员以外的场合,不能访问.
  if (!util.isSystemAdmin(user)  && !util.isSuperAdmin(user)) {
    var err= new errors.Forbidden(__("js.common.access.check"));
    response.send(res_, err);
    return false;
  }
  return true;
}

// 获取用户一览
exports.adminlist = function(req_, res_) {
  var handler=new context().bind(req_, res_);
  //权限check
  if (!commonCheck(req_, res_)) {
    return;
  };

  adminuser.adminlist(handler, function(err, result) {
      response.send(res_, err, result);
  });
};

exports.adminadd = function(req_, res_) {
  var handler=new context().bind(req_, res_);
  //权限check
  if (!commonCheck(req_, res_)) {
    return;
  };

  adminuser.add(handler, function(err, result) {
    response.send(res_, err, result);
  });
};

exports.adminupdate = function(req_, res_) {
  var handler=new context().bind(req_, res_);
  //权限check
  if (!commonCheck(req_, res_)) {
    return;
  };
  adminuser.update(handler, function(err, result) {
    response.send(res_, err, result);
  });
};

exports.adminUpdateActive = function(req_,res_){
  var handler=new context().bind(req_, res_);
  //权限check
  if (!commonCheck(req_, res_)) {
    return;
  };
  adminuser.updateActive(handler, function(err, result) {
    response.send(res_, err, result);
  });
};

exports.adminsearchOne = function(req_, res_) {
  var handler=new context().bind(req_, res_);
  //权限check
  if (!commonCheck(req_, res_)) {
    return;
  };

  adminuser.adminsearchOne(handler, function(err, result) {
    response.send(res_, err, result);
  });
};
