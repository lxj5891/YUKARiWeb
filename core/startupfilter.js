
/**
 * Module dependencies.
 */

var express     = smart.util.express
//  , smart       = require("smartcore")
//  , user        = smart.mod.user
  , auth        = smart.framework.auth
  , middleware  = require("../core/middleware");

var userid = "admin";
var password ="admin";

/**
 * 执行Filter
 */
exports.execute = function(err, callback) {
	//create_admin_filter();
}

/**
 * 生成系统管理员帐号的Filter
 */
function create_admin_filter() {
	user.find(undefined, {type: 3}, function(err, result){
		if(result && result != "")
			return;

		// 初始没有admin用户，生成默认的admin用户
		create_admin();
	});
}

/**
 * 生成系统管理员帐号
 */
function create_admin() {
	var email = "";
	var date = Date.now();

	var info = {"uid": userid
	, "name": {"name_zh": userid}
	, "password": auth.sha256(password)
	, "type": 2                         // 系统管理员
	, "email": {
	  "email1": email
	}
	, lang : "zh"
	, timezone: "GMT+09:00"
	, createat: date
	, createby: userid
	, updateat: date
	, updateby: userid
  , active: 1
	};

	user.createByDBName(undefined, info, function(err, result){
	  if (err) {
	    return new callback_(error.InternalServer(__("user.error.savedError")));
	  }

	  console.log("Create default admin user. id=admin, password=admin");
	});
}


