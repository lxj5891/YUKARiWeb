/**
 * @file 通知
 * @author r2space@gmail.com
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var json      = smart.framework.response
  , errors    = smart.framework.errors
  , notice    = require('../controllers/ctrl_notice')
  , util      = require('../core/utils');

//权限check
function commonCheck(req_, res_) {

  console.log("----------------");

  var user =  req_.session.user;

  console.log(user);

  //DA系统管理员,开发人员以外的场合,不能访问.
  if (!util.hasNoticePermit(user)) {
    var err= new errors.Forbidden(__("js.common.access.check"));
    res_.send(err.code, json.errorSchema(err.code, err.message));
    return false;
  }
  return true;
}
exports.add = function(req_, res_) {
  //权限check
  if (!commonCheck(req_, res_)) {
    return;
  };

  var code = req_.session.user.companycode
    , uid = req_.session.user._id;

  notice.add(code, uid, req_.body, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

// notice list
exports.list = function(req_, res_) {
  //权限check
  if (!commonCheck(req_, res_)) {
    return;
  };
  var code = req_.session.user.companycode
    , keyword = req_.query.keyword
    , start = req_.query.start
    , limit = req_.query.count;

  notice.list(code, keyword, start, limit, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};
