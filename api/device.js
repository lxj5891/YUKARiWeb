var json = lib.core.json
  , device = require('../controllers/ctrl_device.js');

// 获取设备一览
exports.list = function(req_, res_) {

  var start = req_.query.start
    , limit = req_.query.count
    , company = req_.session.user.companyid

  device.list(start, limit, company, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

//
exports.countcompanyid = function(req_, res_) {
  device.countcompanyid (req_, res_, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

/**
 * 允许使用设备
 * @param req_
 * @param res_
 */
exports.allow = function(req_, res_) {

  var uid = req_.session.user._id
    , devid = req_.body.device
    , userid = req_.body.user;

  device.allow (uid, devid, userid, true, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};
exports.deny = function(req_, res_) {

  var uid = req_.session.user._id
    , devid = req_.body.device
    , userid = req_.body.user;

  device.allow (uid, devid, userid, false, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

/**
 * 添加设备+用户
 * 返回值
 *   status: 0 用户禁止使用该设备
 *   status: 1 使用中（承认）
 *   status: 2 使用申请中
 *   status: 3 未申请
 * @param req_
 * @param res_
 */
exports.add = function(req_, res_) {

  var description = req_.body.description
    , devicetype = req_.body.devicetype
    , deviceid = req_.body.deviceid
    , user = req_.session.user
    , confirm = req_.body.confirm;

  device.add (deviceid, user, description, devicetype, confirm, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

exports.login = function(req_, res_) {
  var deviceid = req_.query.deviceid
    , code = req_.query.code
    , devicetype = req_.query.devicetype
    , userid = req_.query.userid;

  device.create(deviceid, userid, code , devicetype , function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};