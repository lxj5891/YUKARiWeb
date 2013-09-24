var json = lib.core.json
  , device = require('../controllers/ctrl_device.js')
  , errors  = lib.core.errors
  , errorsExt = require('../core/errorsExt')
  , y_util = require('../core/utils');

// 获取设备一览
exports.list = function(req_, res_) {

  var start = req_.query.start
    , limit = req_.query.count
    , company = req_.session.user.companyid
    , code = req_.session.user.companycode;

  if(!checkCompanyAdmin(req_, res_))
    return;

  device.list(code, start, limit, company, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

//
exports.countcompanyid = function(req_, res_) {
  var code = req_.session.user.companycode;
  device.countcompanyid (code, req_, res_, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};
exports.deviceAllow = function(req_, res_) {
  var uid = req_.session.user._id
    , devid = req_.body.device
    , code = req_.session.user.companycode;

  if(!checkCompanyAdmin(req_, res_))
    return;

  device.deviceallow (code, uid, devid, true, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
}
exports.deviceDeny = function(req_, res_) {
  var uid = req_.session.user._id
    , devid = req_.body.device
    , code = req_.session.user.companycode;

  if(!checkCompanyAdmin(req_, res_))
    return;

  device.deviceallow (code, uid, devid, false, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
}
/**
 * 设置用户可用
 * @param req_
 * @param res_
 */
exports.allow = function(req_, res_) {

  var uid = req_.session.user._id
    , devid = req_.body.device
    , userid = req_.body.user
    , code = req_.session.user.companycode;

  if(!checkCompanyAdmin(req_, res_))
    return;

  device.setUserDefault(req_.session.user.lang,req_.session.user.timezone);
  device.allow (code, uid, devid, userid, true, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};
/**
 * 设置用户禁止
 * @param req_
 * @param res_
 */
exports.deny = function(req_, res_) {

  var uid = req_.session.user._id
    , devid = req_.body.device
    , userid = req_.body.user
    , code = req_.session.user.companycode;

  if(!checkCompanyAdmin(req_, res_))
    return;

  device.allow (code, uid, devid, userid, false, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

///**
// * 添加设备+用户
// * 返回值
// *   status: 0 用户禁止使用该设备
// *   status: 1 使用中（承认）
// *   status: 2 使用申请中
// *   status: 3 未申请
// * @param req_
// * @param res_
// */
//exports.add = function(req_, res_) {
//
//  var description = req_.body.description
//    , devicetype = req_.body.devicetype
//    , deviceid = req_.body.deviceid
//    , user = req_.session.user
//    , confirm = req_.body.confirm
//    , code = req_.session.user.companycode;
//
//  device.add (code, deviceid, user, description, devicetype, confirm, function(err, result) {
//    if (err) {
//      return res_.send(err.code, json.errorSchema(err.code, err.message));
//    } else {
//      return res_.send(json.dataSchema(result));
//    }
//  });
//};
exports.setDeviceUser = function(req_, res_){
  var deviceid = req_.query.deviceid
    , code = req_.query.code
    , userid = req_.query.userid;
  device.setDeviceUser(code,userid,deviceid,function(err,result){
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });

};
/**
 * 添加设备 check 用户
 *
 * 状态	                   公司存在	   设备存在	      设备许可	用户存在 	 申请用户存在 	用户有效	是否LOGIN	status		error
 申请成功	                   √	       √	           √	      √	       √	       √	       √	     21		     ×
 新设备&&已存在用户申请	     √	       ×	           -	      √	       〇	       √	       ×	     31		     ×
 新设备&&用户不存在 申请	     √	       ×	           -	      ×	       〇	       -	       ×	     32		     ×
 已有设备&&用户不存在 申请	   √	       √	           √	      ×	       -	       -	       ×	     33		     ×
 申请中	                   √	       √	           〇	      ×	       √	       -	       ×	     41		     ×
 申请中	                   √	       √	           〇	      √	       √	       -	       ×	     42		     ×
 设备禁用申请失败            √ 	       √	           ×	      -	       -	       -	       ×	     51		     ×
 设备许可申请存在用户申请失败  √ 	       √	           √	      √	       ×	       -	       ×	     52		     ×
 设备许可申请不存在用户申请失败√ 	       √	           √	      √	       ×	       -	       ×	     53		     ×
 公司不存在错误	             ×	       -	           -	      -	       -	       -	       ×	     61		     √
 设备不许可错误	             √	       √	           ×	      -	       -	       -	       ×	     62		     √
 用户失效	                   √	       √	           √	      √	       √	       √	       ×	     63		     ×
 */
exports.deviceRegister = function(req_, res_) {
  var deviceid = req_.query.deviceid
    , devicetoken = req_.query.token
    , code = req_.query.code
    , devicetype = req_.query.devicetype
    , userid = req_.query.userid;
    if(!userid){
      return res_.send(json.dataSchema({status:"6009"}));
    }
    if(!code){
      return res_.send(json.dataSchema({status:"6008"}));
    }
    if(!deviceid){
      return res_.send(json.dataSchema({status:"6007"}));
    }

    device.deviceRegister(deviceid,devicetoken, userid, code , devicetype , function(err, result) {
      if (err) {
        return res_.send(err.code, json.errorSchema(err.code, err.message));
      } else {

        return res_.send(json.dataSchema(result));
      }
    });
};

// 判断是否是公司的管理员，不是就返回JSON的错误信息
function checkCompanyAdmin(req_, res_) {
  var user = req_.session.user;

  if(!y_util.isAdmin(user)) {
    errorsExt.sendJSON(res_, errors.Forbidden, __("js.common.update.check"));
    return false;
  }
  return true;
}