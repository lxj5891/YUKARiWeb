/**
 * @file 通知
 * @author r2space@gmail.com
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var response      = smart.framework.response
  , errors    = smart.framework.errors
  , context = smart.framework.context
  , notice    = require('../controllers/ctrl_notice')
  , util      = require('../core/utils');

//权限check
function commonCheck(req_, res_) {
  var user =  req_.session.user;
  //DA系统管理员,开发人员以外的场合,不能访问.
  if (!util.hasNoticePermit(user)) {
    var err= new errors.Forbidden(__("js.common.access.check"));
    res_.send(err.code, response.errorSchema(err.code, err.message));
    return false;
  }
  return true;
}


/**
 * updated by wuql on 14/01/02
 */
exports.add = function(req_, res_) {
  var handler = new context().bind(req_,res_);
  //权限check
  if (!commonCheck(req_, res_)) {
    return;
  };

  notice.add(handler, function(err, result) {
    response.send(res_,err,result);
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
    response.send(res_,err,result);
  });
};
