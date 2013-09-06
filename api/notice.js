/**
 * Created with JetBrains WebStorm.
 * User: Antony
 * Date: 13-8-21
 * Time: 下午7:36
 * To change this template use File | Settings | File Templates.
 */

var json = lib.core.json
  , notice = require('../controllers/ctrl_notice');

exports.add = function(req_, res_) {

  var uid = req_.session.user._id;

  notice.add(uid, req_.body, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

// notice list
exports.list = function(req_, res_) {

  var company = req_.session.user.companyid
    , start = req_.query.start
    , limit = req_.query.count;

  notice.list(company, start, limit, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};
