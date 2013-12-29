/**
 * @file 存取公司信息的controllers
 * @author r2space@gmail.com
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var _         = smart.util.underscore
  , ph         =smart.lang.path
  , user       =smart.ctrl.user
  , async     = smart.util.async
  , check     = smart.util.validator.check
  , error     = smart.framework.errors
  , log       = smart.framework.log
  , auth      = smart.framework.auth
  , context   = smart.framework.context
  , device    = require('../controllers/ctrl_device')
  , company   = smart.ctrl.company;



/**
 * 获取公司一览
 * @param handler
 * @param callback
 * @auth zhaobing
 */
exports.list = function(handler,callback) {

  var start_ = handler.params.start
    , limit_ = handler.params.count
    , keyword_ =handler.params.keyword;
  var start =  start_||0
    , limit = limit_||20
    , condition = { valid:1 };
  if (keyword_) {
    condition.$or = [{ "name": new RegExp(keyword_.toLowerCase(), "i") }];
  }

  handler.addParams("start",start);
  handler.addParams("limit",limit);
  handler.addParams("condition",condition);

  company.getList(handler, function(err, result) {
    var items = result.items;

    if (err) {
      log.error(err, uid);
      return callback(new error.NotFound("js.ctr.common.system.error"));
    } else {
      for(var k in items) {
        items[k].kindex = k;
      }
      var complist = [];
      var getUserByCode= function (comp_,sub_callback){
        var userhandler = new context().create("",comp_._doc.code,"");
        var condition = {"extend.type":1};
        userhandler.addParams("condition",condition);
        user.getList(userhandler,function(err,result){
          var userItem = result.items;
          if (err) {
            return callback(new error.InternalServer(err));
          }else{
            if(userItem && userItem.length>0){
              comp_._doc.userName = userItem[0].userName;
            }
            complist[comp_.kindex] = comp_;
            sub_callback(err,result);
          }
        });

      }
      async.forEach(items,getUserByCode,function(err){
        callback(err,result);
      });
  }});
};

exports.companyListWithDevice = function(start_, limit_, callback){
  exports.getList(start_, limit_, function(err, comps){
    var task_getDeviceCount = function(comp_,subCB){
      device.deviceTotalByComId(comp_._id.toString(),function(err,count){
        comp_._doc.deviceCount = count;
        user.userTotalByComId(comp_._id.toString(),function(err,ucount){
          comp_._doc.userCount = ucount;
          subCB(err);
        });

      });
    };
    async.forEach(comps.items, task_getDeviceCount, function(err){
      callback(err, comps);
    });


  });
};

exports.searchOne = function( handler, callback) {
  handler.addParams("domain",handler.params.compid);
  var compInfo = {};
  company.getByDomain(handler,function(err,result){
    var items = result;
    compInfo = result;
    if (err) {
      log.error(err, uid);
      return callback(new errors.NotFound("js.ctr.common.system.error"));
    } else {
        var userhandler = new context().create("",items._doc.code,"");
        var condition = {"extend.type":1};
        userhandler.addParams("condition",condition);
        user.getList(userhandler,function(err,result){
          var userItem = result.items;
          console.log(" userItem"+ userItem);
          if (err) {
            return callback(new error.InternalServer(err));
          }else{
            if(userItem && userItem.length>0){
              result.compInfo = compInfo;
              items._doc.userName = userItem[0].userName;
              return callback(err,result);
           }
          }
        });
      }

    });
};

// 通过公司ID获取指定公司
exports.getByPath = function( path, callback_) {
  company.getByPath(path, function(err, result){
    if (err) {
      return callback_(new error.InternalServer(err));
    }
    return callback_(err, result);
  });

};
// 通过公司Code获取指定公司
exports.getByCode = function( code, callback_) {
  company.getByCode(code, function(err, result){
    if (err) {
      return callback_(new error.InternalServer(err));
    }
    return callback_(err, result);
  });

};

exports.add = function(handler, callback) {
  var comphandler = new context().create(handler.uid,"","");
  var comp = handler.params.body_company;
  if(comp.code){
    comphandler.params.code = comp.code;
  }
  comphandler.params.name = comp.name;
  comphandler.params.domain = comp.domain;
  comphandler.params.type = comp.type;
  comphandler.params.extend = comp.extend;

  var tasks = [];

  tasks.push(function(callback){
  //添加公司
    company.add(comphandler, function(err, result) {
      if (err) {
        log.error(err, comphandler.uid);
        return callback(new error.NotFound("js.ctr.common.system.error"));
      } else {
        return callback(err, result);
      }
    });
  });

  tasks.push(function(result,callback){
    var userhandler = new context().create(handler.uid,result.code,handler.params.body_user.lang)
      , inuser = handler.params.body_user;
    userhandler.params.userName = inuser.userid;
    userhandler.params.password = auth.sha256(inuser.password);
    userhandler.params.timezone = inuser.timezone;
    userhandler.params.lang = inuser.lang;
    var extend  = {};
    extend.type = 1;
    extend.active = 1;
    userhandler.params.extend = extend;
  //添加用户
    user.add(userhandler,function(err,result){
      if (err) {
        log.error(err, userhandler.uid);
        return callback(new error.NotFound("js.ctr.common.system.error"));
      } else {
        return callback(err, result);
      }
    })
  });
  async.waterfall(tasks, function(err, result){
    return callback(err, result);
  });

};

/**
 * 更新指定公司
 * @param uid_
 * @param comp_
 * @param callback_
 * @returns {*}
 */
exports.update = function(uid_, data_, callback_) {
  try {
    /** 公司*/
    //会社名(かな)
    if (data_.body_company.kana != undefined) {
      check(data_.body_company.kana, __("js.ctr.check.company.kana.min")).notEmpty();
      check(data_.body_company.kana, __("js.ctr.check.company.kana.max")).notEmpty().len(1,30);
    }
    //会社名(英語)
    if (data_.body_company.name != undefined) {
//      check(data_.body_company.name, __("js.ctr.check.company.name.min")).notEmpty();
      check(data_.body_company.name, __("js.ctr.check.company.name.max")).len(0,30);
    }
    //会社ID
    if (data_.body_company.path != undefined) {
      check(data_.body_company.path, __("js.ctr.check.company.path.min")).notEmpty();
      check(data_.body_company.path, __("js.ctr.check.company.path.max")).len(0,20);
    }
    //会社住所
    if (data_.body_company.address != undefined) {
//      check(data_.body_company.address, __("js.ctr.check.company.address.min")).notEmpty();
      check(data_.body_company.address, __("js.ctr.check.company.address.max")).len(0,50);
    }
    //電話番号
    if (data_.body_company.tel != undefined) {
      check(data_.body_company.tel, __("js.ctr.check.company.tel")).len(0,30);
    }

  } catch (e) {
    return callback_(new error.BadRequest(e.message));
  }

  var comp_ = data_.body_company;
  comp_.editat = new Date();
  comp_.editby = uid_;

  // path check
  var pathcheck = comp_.path  ? comp_.path : "";
  company.find({path:pathcheck}, function(err, coms){
    if (err) {
      return  callback_(new error.InternalServer(__("js.ctr.common.system.error")));
    }
    if (coms.length > 0) {
      return callback_(new error.BadRequest(__("js.ctr.check.company.path")));
    } else {
      company.update(comp_.id, comp_, function(err, result){
        if (err) {
          return callback_(new error.InternalServer(err));
        }
        return callback_(err, result);
      });
    }
  });

};
exports.active= function(uid_, comp_, callback_) {
  comp_.editat = new Date();
  comp_.editby = uid_;
  var dbName = comp_.code;

  async.waterfall([
    // 更新公司
    function(callback) {
      company.update(comp_.id,comp_, function(err, result) {
        callback(err, result);
      });
    },

    // 更新用户
    function(result,callback) {
      user.activeByDBName(dbName,uid_, comp_.active, function(err,rtn){
        callback(err, rtn);
      });
    }

  ], function(err, result) {
    callback_(err, result);
  });

};
//随机生成唯一的code
function createCode(callback) {

  var guid8 = util.randomGUID8();

  comp.count({ code: guid8 }).exec(function(err, count) {
    if (err) {
      return callback(err);
    }

    if (count > 0) {
      createCode(comp, callback);
    } else {
      return callback(err, guid8);
    }
  });
}
