var sync     = require('async')
  , _         = require('underscore')
  , check     = require('validator').check
  , device   = require('../modules/mod_device.js')
  , company   = require('../modules/mod_company.js')
  , user     = lib.ctrl.user
  , mod_user     = lib.mod.user
  , error     = lib.core.errors
  , passutil      = lib.core.util

var EventProxy = require('eventproxy');
var that_device = device;
/**
 * 获取设备一览
 * @param start_
 * @param limit_
 * @param callback_
 */
exports.list = function(code, start_, limit_, company_, callback_) {

  var start = start_ || 0
    , limit = limit_ || 20
    , condition = {
      valid:1
    };
  device.total(code, function(err, count){
    if (err) {
      return callback_(new error.InternalServer(err));
    }
    device.list(code, condition, start, limit, function(err, result){
      console.log(err);
      if (err) {
        return callback_(new error.InternalServer(err));
      }
      return callback_(err,  {totalItems: count, items:result});
    });
  });
};

function updateAllow(code, session_uid, device_id, user_id, allow_, pass, callbak_) {
//  var allow_ = 1;
  var update_ep = EventProxy.create("update_apply", "update_user", function (update_apply, update_user) {
    callbak_(null,"allow");
  });
  update_ep.fail(function (err) {
    callbak_(err);
  });
  updateApplyFn(code, session_uid , device_id , user_id , allow_ , update_ep.done("update_apply"));
  updateUserFn(code, session_uid, user_id, pass, update_ep.done("update_user"));
};
function updateApplyFn(code, session_uid , device_id , user_id , allow_ ,callback_){
  device.allow(code, session_uid, device_id, user_id, allow_, function(err, result){
    if (!err) {
      // TODO: add apn push
    }
    console.log(result);
    return callback_(err, result);
  });
}
function updateUserFn(code , session_uid , user_,pass,callback_){
  var userinfo_ = {
    userid : user_,
    password : pass,
    type : 0 ,
    name : {name_zh : "ipad user"},
    companycode: code,
    "lang" : "ja" ,
    "timezone" : "GMT+08:00"

  }
  user.addByDBName(code , session_uid ,userinfo_ ,function(err,result){
    if(!err){
      console.log("ipad创建用户密码为 : " + pass);
    }else{
      console.log("用户已存在");
    }

    callback_(null,result)
  })
}
function findApply(code,deviceid,userid,callback_){
  var query  = {deviceid: deviceid, "userinfo.userid": userid, companycode: code ,valid : 1};
  console.log(query);
  device.find(code, query, function (err, result) {
    if (result && result.length > 0) {
      callback_(err, result[0]);
    } else {
      callback_(null, null);
    }
  });
}
// 允许，禁用设备
exports.allow = function(code, session_uid, device_, user_id, allow_,callback_) {
  var pass = passutil.randomGUID4();

  //判断用户状态
  var ep = EventProxy.create("apply_ep","user_ep",function(apply_ep,user_ep){
    updateAllow(code, session_uid, apply_ep.deviceid, user_id, allow_,pass,  function(err,result){
      console.log("allow");
      console.log(err);

      callback_(err, result);
    });
  });
  ep.fail(function(err){
    console.log("// 允许，禁用设备  error");
    callback_(0);
  });
  findApply(code,device_,user_id, ep.done("apply_ep"));
  checkUserByUid(code, user_id, ep.done("user_ep"));
  //不存在


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

exports.create = function (deviceid,devicetoken, userid, code, devicetype ,callback_) {

  var ep = EventProxy.create("device", "user", "company","apply", function (device_docs, user_docs, company_docs,apply_docs) {

    var status = "61";
    var user_status = "2";
    //状态	                   公司存在	   设备存在	      设备许可	用户存在 	 申请用户存在 	用户有效	是否LOGIN	status		error
    //公司不存在错误	             ×	       -	           -	      -	       -	       -	       ×	     61		     √
    if(!company_docs){
      status = "61";
      return callback_(null, {status: status, debug:"公司不存在错误"});
    }
    //状态	                   公司存在	   设备存在	      设备许可	用户存在 	 申请用户存在 	用户有效	是否LOGIN	status		error
    //设备不许可错误	             √	       √	           ×	      -	       -	       -	       ×	     62		     √
    if(device_docs && device_docs.length>0 && device_docs[0].devstatus == "0"){
      status = "62";
      return callback_(null, {status: status, debug:"设备不许可错误"});
    }
    //状态	                   公司存在	   设备存在	      设备许可	用户存在 	 申请用户存在 	用户有效	是否LOGIN	status		error
    //用户失效	                   √	       √	           √	      √	       √	       √	       ×	     63		     ×
    if(user_docs && user_docs.valid == 0){
      status = "63";
      return callback_(null, {status: status, debug:"用户失效"});
    }

    //状态	                   公司存在	   设备存在	      设备许可	用户存在 	 申请用户存在 	用户有效	是否LOGIN	status		error
    //申请中	                   √	       √	           〇	      √	       √	       -	       ×	     42		     ×
    //申请成功	                 √	       √	           √	      √	       √	       √	       √	     21		     ×
    //设备禁用申请失败           √ 	       √	           ×	      -	       -	       -	       ×	     51		     ×
    //设备许可申请存在用户申请失败 √ 	       √	           √	      √	       ×	       -	       ×	     52		     ×
    //许可申请不存在用户申请失败   √ 	       √	           √	      √	       ×	       -	       ×	     53		     ×
    if (apply_docs&&apply_docs.length > 0) {
      console.log(apply_docs);
      status = "42";
      for (var i in apply_docs[0].userinfo) {
        var _userinfo = apply_docs[0].userinfo[i];

        if (_userinfo.userid == userid && _userinfo.status == "1" ) {
          status = "21";
          return callback_(null, {status: status, debug: "申请成功"});
        }
        if (_userinfo.userid == userid && _userinfo.status == "0" ) {
          if(!user_docs){
            status = "52";
          } else {
            status = "53";
          }
          return callback_(null, {status: status, debug: "设备禁用申请失败"});
        }
        if (_userinfo.userid == userid && (_userinfo.status == "2" || _userinfo.status == "3" )) {
          return callback_(null, {status: status, debug: "申请中"});
        }
      }
    }
    //状态	                   公司存在	   设备存在	      设备许可	用户存在 	 申请用户存在 	用户有效	是否LOGIN	status		error
    //申请成功	                   √	       √	           √	      √	       √	       √	       √	     21		     ×

    //状态	                   公司存在	   设备存在	      设备许可	用户存在 	 申请用户存在 	用户有效	是否LOGIN	status		error
    //新设备&&已存在用户申请	     √	       ×	           -	      √	       ×	       √	       ×	     31		     ×
    //新设备&&用户不存在 申请	   √	       ×	           -	      ×	       ×	       -	       ×	     32		     ×
    //已有设备&&用户不存在 申请	   √	       √	           √	      ×	       -	       -	       ×	     33		     ×

    //用户不存在
    if (!user_docs) {
      status = "32";
      user_status = "3";
    } else {
      status = "31";
    }
//    console.log(device_docs)
//    console.log(user_docs);
//    console.log(company_docs);
//    console.log(apply_docs);


    if(!device_docs){
      //添加 新申请
      var object = {
          "companycode" : company_docs.code
        , "devicetoken" : devicetoken
        , "companyid": company_docs._id
        , "deviceid": deviceid
        , "deviceType": devicetype
        , "devstatus" : 1
        , "userinfo": [{
          "userid": userid
          , "status": user_status
        }]
        , createat: new Date()
        , createby: userid
        , editat: new Date()
        , editby: userid
      }
      device.add(code, object, function(err, result){
        console.log("device.add");
        console.log(result);
        return callback_(null, {status: status});
      });
    } else {
      // 否则给设备添加一个用户
      status = "33";
      var object = {
        $push: {"userinfo": {"userid": userid, "status": user_status}}
        , editat: new Date()
        , editby: userid
      }
      // 更新
      device.update(code, device_docs[0]._id, object, function(err, result){
        console.log("device.update");
        console.log(result);
        return callback_(err, {status: status});
      });
    }
  });
  ep.fail(callback_);
  checkDeviceId(code, deviceid, ep.done("device"));
  checkUserByUid(code, userid, ep.done("user"));
  checkCompanyCode(code, ep.done("company"));
  checkApply(code, deviceid, userid, code, ep.done("apply"));

};

function checkApply(code, deviceid, userid, code, callback_) {
  var query  = {deviceid: deviceid, "userinfo.userid": userid, companycode: code ,valid : 1};
  console.log(query);
  device.find(code, query, function (err, result) {
    if (result && result.length > 0) {
      callback_(err, result);
    } else {
      callback_(null, null);
    }
  });
};

function checkUserByUid(code, userid, callback) {
  //TODO:
  mod_user.find({uid: userid}, function (err, result) {
    if (result && result.length > 0) {
      callback(null, result[0]);
    } else {
      callback(null, null);
    }
  });
};

function checkCompanyCode(code, callback) {
  company.find({code: code}, function (err, result) {
    if (result && result.length > 0) {
      callback(null, result[0]);
    } else {
      callback(null, null);
    }
  });
};

function checkDeviceId(code, deviceid, callback) {
  device.find(code, {"deviceid": deviceid}, function (err, result) {
    if (result && result.length > 0) {
      callback(null, result);
    } else {
      callback(null, null);
    }
  });
};

/**
 * 添加设备
 */
exports.add = function(code, deviceid, user, description, devicetype, confirm, callback_) {

  // check device & user exists
  device.find(code, {"deviceid": deviceid}, function(err, result){

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
      device.update(code, d._id, object, function(err, result){
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
      device.add(code, object, function(err, result){
        return callback_(err, {status: "2"});
      });
    }
  });

};

//
exports.deviceTotalByComId = function(code, compId_, callback_) {
  device.deviceTotalByComId(code, compId_, function(err, result){
    if (err) {
      return callback_(new error.InternalServer(err));
    }
    return callback_(err,  result);
  });
};




