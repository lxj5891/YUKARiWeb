var smart     = require("smartcore")
  , json      = smart.core.json
  , errors    = smart.core.errors
  , adminuser = require('../controllers/ctrl_admin_user')
  , util      = require('../core/utils');

//权限check
function commonCheck(req_, res_) {
  var user =  req_.session.user;
  //DA系统管理员,开发人员以外的场合,不能访问.
  if (!util.isSystemAdmin(user)  && !util.isSuperAdmin(user)) {
    var err= new errors.Forbidden(__("js.common.access.check"));
    res_.send(err.code, json.errorSchema(err.code, err.message));
    return false;
  }
  return true;
}

// 获取用户一览
exports.adminlist = function(req_, res_) {
  //权限check
  if (!commonCheck(req_, res_)) {
    return;
  };
  var uid =req_.session.user._id;
  adminuser.adminlist(uid, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

exports.adminadd = function(req_, res_) {
  //权限check
  if (!commonCheck(req_, res_)) {
    return;
  };
  var uid = req_.session.user._id;

  adminuser.add(uid, req_.body, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

exports.adminupdate = function(req_, res_) {
  //权限check
  if (!commonCheck(req_, res_)) {
    return;
  };
  var uid = req_.session.user._id;

  adminuser.update(uid, req_.body, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};
exports.adminsearchOne = function(req_, res_) {
  //权限check
  if (!commonCheck(req_, res_)) {
    return;
  };
  var code = req_.query.code;
  var userid = req_.query.userid;

  adminuser.adminsearchOne(code, userid, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};
