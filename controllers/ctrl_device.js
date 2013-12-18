var sync = smart.util.async
  , _ = smart.util.underscore
  , check = smart.framework.validator.check
  , device = require('../modules/mod_device.js')
  , company = require('../modules/mod_company.js')
  , user = smart.ctrl.user
//  , mod_user = smart.mod.user
  , error = smart.core.errors
  , passutil = smart.lang.util
  , auth = smart.framework.auth
  , mq = require('./ctrl_mq');

var EventProxy = require('eventproxy');
var that_device = device;

exports.lang = '';
exports.timezone = '';

exports.setUserDefault = function (lang_, timezone_) {
  exports.lang = lang_;
  exports.timezone = timezone_;
};
/**
 * 获取设备一览
 * @param start_
 * @param limit_
 * @param callback_
 */
exports.list = function (code, start_, limit_, company_, callback_) {

  var start = start_ || 0
    , limit = limit_ || 20
    , condition = {
      valid: 1
    };
  device.total(code, function (err, count) {
    if (err) {
      return callback_(new error.InternalServer(err));
    }
    device.getListByPage(code, condition, start, limit, function (err, result) {
      console.log(err);
      if (err) {
        return callback_(new error.InternalServer(err));
      }
      return callback_(err, {totalItems: count, items: result});
    });
  });
};

//许可
function updateAllow(code, session_uid, device_id, user_id, allow_, pass, callbak_) {

  var update_ep = EventProxy.create("update_apply", "update_user", function (update_apply, update_user) {
    callbak_(null, "allow");
  });

  update_ep.fail(function (err) {
    callbak_(err);
  });


  updateApplyFn(code, session_uid, device_id, user_id, allow_, update_ep.done("update_apply"));
  updateUserFn(code, session_uid, user_id, device_id, pass, update_ep.done("update_user"));

};

//调用许可设备接口
function updateApplyFn(code, session_uid, device_id, user_id, allow_, callback_) {


  device.allow(code, session_uid, device_id, user_id, allow_, function (err, result) {
    if (!err) {
    }
    return callback_(err, result);
  });


}
//创建新用户  并发送密码
function updateUserFn(code, session_uid, user_, device_id, pass, callback_) {

  var userinfo_ = {
    userid: user_,
    password: pass,
    type: 0,
    name: {name_zh: user_},
    companycode: code,
    "lang": exports.lang,
    "timezone": exports.timezone,
    "valid": 1,
    "active": 1,
    "authority": {
      notice: 1
    }
  };

  user.addByDBName(code, session_uid, userinfo_, function (err, result) {
    if (!err) {
      //apn发送密码
      mq.pushApnMessage({
        code: code, target: user_, body: pass, type: "password"
      });
      console.log("ipad创建用户密码为 : " + pass);
      return callback_(null, {debug: "ipad创建用户密码为 : " + pass});
    } else {
      console.log("用户已存在");
      return callback_(null, {debug: "用户已存在"});
    }


  });
};

//查找用户的申请
function findApply(code, deviceid, userid, callback_) {
  var query = {deviceid: deviceid, "userinfo.userid": userid, companycode: code, valid: 1};
  console.log(query);
  device.getList(code, query, function (err, result) {
    if (result && result.length > 0) {
      callback_(err, result[0]);
    } else {
      callback_(null, null);
    }
  });
}

//允许禁止  设备
exports.deviceallow = function (code, session_uid, device_, allow_, callback_) {
  checkDeviceId(code, device_, function (err, device_docs) {
    var docs = undefined;
    if (err) {
      return callback_(null, 0);
    }
    if (device_docs) {
      docs = device_docs instanceof Array ? device_docs[0] : docs;
    } else {
      return callback_(null, 0);
    }


    var device_update = {
      devstatus: allow_ ? "1" : "0"
    }

    device.update(code, docs._id, device_update, function (err, result) {
      callback_(err, result);
    });


  });
}

// 允许，禁用设备用户
exports.allow = function (code, session_uid, device_, user_id, allow_, callback_) {
  // 初始化密码为邮件(user_id) 中"@"之前的字符
  /^(.*)@.*$/.test(user_id);
  var pass = RegExp.$1 == "" ? user_id : RegExp.$1;
  //pass = auth.sha256(pass);

  //判断用户状态
  var ep = EventProxy.create("apply_ep", "user_ep", function (apply_ep, user_ep) {

    updateAllow(code, session_uid, apply_ep.deviceid, user_id, allow_, pass, function (err, result) {
      callback_(err, result);
    });

  });

  ep.fail(function (err) {
    console.log("// 允许，禁用设备  error");
    callback_(err);
  });


  findApply(code, device_, user_id, ep.done("apply_ep"));
  checkUserByUid(code, user_id, ep.done("user_ep"));
  //不存在


};

/**
 * 添加设备 check 用户
 *
 * 状态                     公司存在     设备存在        设备许可  用户存在   申请用户存在  用户有效  是否LOGIN  status    error
 申请成功                     √         √             √        √         √         √         √       21         ×
 新设备&&已存在用户申请       √         ×             -        √         〇         √         ×       31         ×
 新设备&&用户不存在 申请       √         ×             -        ×         〇         -         ×       32         ×
 已有设备&&用户不存在 申请     √         √             √        ×         -         -         ×       33         ×
 申请中                     √         √             〇        ×         √         -         ×       41         ×
 申请中                     √         √             〇        √         √         -         ×       42         ×
 设备禁用申请失败            √         √             ×        -         -         -         ×       51         ×
 设备许可申请存在用户申请失败  √         √             √        √         ×         -         ×       52         ×
 设备许可申请不存在用户申请失败√         √             √        √         ×         -         ×       53         ×
 公司不存在错误               ×         -             -        -         -         -         ×       61         √
 设备不许可错误               √         √             ×        -         -         -         ×       62         √
 用户失效                     √         √             √        √         √         √         ×       63         ×
 */
exports.deviceRegister = function (deviceid, devicetoken, userid, code, devicetype, callback_) {
  checkCompanyCode(code, function (err, result) {
    if (!result) {
      return callback_(null, {status: "6001"});
    }
    checkDeviceUser(deviceid, devicetoken, userid, code, devicetype, function (err, result) {
      var permission_list = ["2001", "3001", "3002" , "3003" , "4001" , "4002"];
      var permission_userid = "";

      permission_userid = permission_list.indexOf(result.status) > -1 ? userid : null;

      exports.setDeviceUser(code, permission_userid, deviceid, function () {
        console.log("设置deivce  uid  " + permission_userid);
        return;
      });
      callback_(err, result)
    });
  });

};

function checkDeviceUser(deviceid, devicetoken, userid, code, devicetype, callback_) {


  var ep = EventProxy.create("device", "user", "company", "apply", function (device_docs, user_docs, company_docs, apply_docs) {

    var status = "6001";
    var user_status = "2";
    //状态	                   公司存在	   设备存在	      设备许可	用户存在 	 申请用户存在 	用户有效	是否LOGIN	status		error
    //公司不存在错误	             ×	       -	           -	      -	       -	       -	       ×	     61		     √
    if (!company_docs) {
      status = "6001";
      return callback_(null, {status: status, debug: "公司不存在错误"});
    }
    //状态	                   公司存在	   设备存在	      设备许可	用户存在 	 申请用户存在 	用户有效	是否LOGIN	status		error
    //设备不许可错误	             √	       √	           ×	      -	       -	       -	       ×	     62		     √
    if (device_docs && device_docs.length > 0 && device_docs[0].devstatus == "0") {
      status = "6002";
      return callback_(null, {status: status, debug: "设备不许可错误"});
    }
    //状态	                   公司存在	   设备存在	      设备许可	用户存在 	 申请用户存在 	用户有效	是否LOGIN	status		error
    //用户失效	                   √	       √	           √	      √	       √	       √	       ×	     63		     ×
    if (user_docs && user_docs.valid == 0) {
      status = "6003";
      return callback_(null, {status: status, debug: "用户失效"});
    }

    //状态	                   公司存在	   设备存在	      设备许可	用户存在 	 申请用户存在 	用户有效	是否LOGIN	status		error
    //申请中	                   √	       √	           〇	      √	       √	       -	       ×	     42		     ×
    //申请成功	                 √	       √	           √	      √	       √	       √	       √	     21		     ×
    //设备禁用申请失败           √ 	       √	           ×	      -	       -	       -	       ×	     51		     ×
    //设备许可申请存在用户申请失败 √ 	       √	           √	      √	       ×	       -	       ×	     52		     ×
    //许可申请不存在用户申请失败   √ 	       √	           √	      √	       ×	       -	       ×	     53		     ×
    if (apply_docs && apply_docs.length > 0) {
      status = "4002";
      for (var i in apply_docs[0].userinfo) {
        var _userinfo = apply_docs[0].userinfo[i];

        if (_userinfo.userid == userid && _userinfo.status == "1") {
          status = "2001";
          return callback_(null, {status: status, debug: "申请成功"});
        }
        if (_userinfo.userid == userid && _userinfo.status == "0") {
          if (!user_docs) {
            status = "5002";
          } else {
            status = "5003";
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
      status = "3002";
      user_status = "3";
    } else {
      status = "3001";
    }
//    console.log(device_docs)
//    console.log(user_docs);
//    console.log(company_docs);
//    console.log(apply_docs);


    if (!device_docs) {
      //添加 新申请
      var object = {
        "companycode": company_docs.code, "devicetoken": devicetoken, "companyid": company_docs._id, "deviceid": deviceid, "deviceType": devicetype, "devstatus": 1, "userinfo": [
          {
            "userid": userid, "status": user_status
          }
        ], createat: new Date(), createby: userid, editat: new Date(), editby: userid
      }
      device.add(code, object, function (err, result) {
//        console.log("device.add");
//        console.log(result);
        return callback_(null, {status: status});
      });
    } else {
      // 否则给设备添加一个用户
      status = "3003";
      var object = {
        $push: {"userinfo": {"userid": userid, "status": user_status}}, editat: new Date(), editby: userid
      }
      // 更新
      device.update(code, device_docs[0]._id, object, function (err, result) {
//        console.log("device.update");
//        console.log(result);
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
  var query = {deviceid: deviceid, "userinfo.userid": userid, companycode: code, valid: 1};
  console.log(query);
  device.getList(code, query, function (err, result) {
    if (result && result.length > 0) {
      callback_(err, result);
    } else {
      callback_(null, null);
    }
  });
};

function checkUserByUid(code, userid, callback) {
  //TODO:
  mod_user.findOneUser(code, {uid: userid}, function (err, result) {
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
  device.getList(code, {"deviceid": deviceid}, function (err, result) {
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
exports.add = function (code, deviceid, user, description, devicetype, confirm, callback_) {

  // check device & user exists
  device.getList(code, {"deviceid": deviceid}, function (err, result) {

    if (result && result.length > 0) {

      // 如果存在用户，则返回用户的申请状态
      var d = result[0];
      var info = _.find(d.userinfo, function (u) {
        return u.userid == user.uid;
      });
      if (info) {
        return callback_(null, {status: info.status});
      }

      // 如果仅仅是确认，则当没有数据的时候返回为申请的状态
      if (confirm) {
        return callback_(null, {status: "3"});
      }

      // 否则给设备添加一个用户
      var object = {
        $push: {"userinfo": {"userid": user.uid, "status": "2"}}, editat: new Date(), editby: user.uid
      }
      console.log(d._id);
      console.log(object);
      // 更新
      device.update(code, d._id, object, function (err, result) {
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
        "companyid": user.companyid, "deviceid": deviceid, "deviceType": devicetype, "devstatus": 1, "userinfo": [
          {
            "userid": user.uid, "status": "2"
          }
        ], "description": description, createat: new Date(), createby: user.uid, editat: new Date(), editby: user.uid
      }
      device.add(code, object, function (err, result) {
        return callback_(err, {status: "2"});
      });
    }
  });

};

//
exports.deviceTotalByComId = function (code, compId_, callback_) {
  device.totalByComId(code, compId_, function (err, result) {
    if (err) {
      return callback_(new error.InternalServer(err));
    }
    return callback_(err, result);
  });
};

exports.setDeviceUser = function (code_, userid_, deviceid_, callback_) {
  var query = {deviceid: deviceid_};
  var obj = {
    deviceid: deviceid_,
    deviceuid: userid_
  };

  device.getAndUpdate(code_, query, obj, function (err, result) {
    callback_(err, result);
  });

}


