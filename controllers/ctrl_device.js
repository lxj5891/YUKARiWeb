var sync     = require('async')
  , _         = require('underscore')
  , check     = require('validator').check
  , device   = require('../modules/mod_device.js')
  , user     = lib.ctrl.user
  , error     = lib.core.errors

/**
 * 获取设备一览
 * @param start_
 * @param limit_
 * @param callback_
 */
exports.list = function(start_, limit_, company_, callback_) {

  var start = start_ || 0
    , limit = limit_ || 20
    , condition = {
      valid:1
      ,companyid:company_
    };
  device.total(function(err, count){
    if (err) {
      return callback_(new error.InternalServer(err));
    }
    device.list(condition, start, limit, function(err, result){
      console.log(err);
      if (err) {
        return callback_(new error.InternalServer(err));
      }
      return callback_(err,  {totalItems: count, items:result});
    });
  });
};

// 允许，禁用设备
exports.allow = function(uid_, device_, user_, allow_,callback_) {
  device.allow(uid_, device_, user_, allow_, function(err, result){
    if (!err) {
      // TODO: add apn push
    }

    return callback_(err, result);
  });
};

/**
 * 添加设备
 */
exports.add = function(deviceid, user, description, devicetype, confirm, callback_) {

  // check device & user exists
  device.find({"deviceid": deviceid}, function(err, result){

    if (result && result.length > 0) {

      // 如果存在用户，则返回用户的申请状态
      var d = result[0];
      var info = _.find(d.userinfo, function(u){ return u.userid == user.uid; });
      if (info) {
        return callback_(null, {status: info.status});
      }

      // 如果仅仅是确认，则当没有数据的时候返回为申请的状态
      if (confirm) {
        return callback_(null, {status: "3"});
      }

      // 否则给设备添加一个用户
      var object = {
          $push: {"userinfo": {"userid": user.uid, "status": "2"}}
        , editat: new Date()
        , editby: user.uid
      }
      console.log(d._id);
      console.log(object);
      // 更新
      device.update(d._id, object, function(err, result){
        console.log(err);
        return callback_(err, {status: "2"});
      });

      // 新规
    } else {

      // 如果仅仅是确认，则当没有数据的时候返回为申请的状态
      if (confirm) {
        return callback_(null, {status: "3"});
      }

      var object = {
        "companyid": user.companyid
        , "deviceid": deviceid
        , "deviceType": devicetype
        , "devstatus" : 1
        , "userinfo": [{
          "userid": user.uid
          , "status": "2"
        }]
        , "description": description
        , createat: new Date()
        , createby: user.uid
        , editat: new Date()
        , editby: user.uid
      }
      device.add(object, function(err, result){
        return callback_(err, {status: "2"});
      });
    }
  });

};

//
exports.deviceTotalByComId = function(compId_, callback_) {
  device.deviceTotalByComId(compId_, function(err, result){
    if (err) {
      return callback_(new error.InternalServer(err));
    }
    return callback_(err,  result);
  });
};




