/**
 * Created with JetBrains WebStorm.
 * User: Antony
 * Date: 13-8-21
 * Time: 下午7:36
 * To change this template use File | Settings | File Templates.
 */

var json = lib.core.json
  , notice = require('../controllers/ctrl_notice')
  , errors  = lib.core.errors
  , util = require('../core/utils');

//权限check
function commonCheck(req_, res_) {
  var user =  req_.session.user;
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
