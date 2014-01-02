/**
 * @file 存取公司信息的controllers
 * @author r2space@gmail.com
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var _         = smart.util.underscore
  , yiutil      = require('../core/utils')
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
        //var userhandler = new context().create("",comp_._doc.code,"");
        var userhandler=new context().create("","","");
            userhandler.code=comp_._doc.code;
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

  var condition = {"_id" : handler.params.compid };
  handler.addParams("condition",condition);
  handler.addParams("start",0);
  handler.addParams("limit",20);
  handler.addParams("order",null);

  var compInfo = {};

  company.getList(handler,function(err,result){
    var items = result.items[0];
    compInfo =  result.items[0];

    if (err) {
      log.error(err, uid);
      return callback(new errors.NotFound("js.ctr.common.system.error"));
    } else {
//      var userhandler = new context().create("",items._doc.code,"");
      handler.code = items._doc.code;
      var condition = {"extend.type":1};
      handler.addParams("condition",condition);

      user.getList(handler,function(err,result){

          var userItem = result.items;
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
  var comp = handler.params.body_company
     ,compAll=handler.params;
  if(comp.code){
    comphandler.params.code = comp.code;
  }
  comphandler.params.name = comp.name;
  comphandler.params.domain = comp.domain;
  comphandler.params.type = comp.type;
  comphandler.params.extend = comp.extend;


  yiutil.checkCompany(compAll,function(checkErr){
    if(checkErr){
      callback(checkErr);
    }else{

      handler.params.body_user.password = auth.sha256(compAll.body_user.password );
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
    var userhandler = new context().create(handler.uid,"",handler.params.body_user.lang)
      , inuser = handler.params.body_user;
    userhandler.code=result.code;
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
  })
      async.waterfall(tasks, function(err, result){
        return callback(err, result);
      });
  }
 });

};

/**
 * 更新指定公司
 * @param uid_
 * @param comp_
 * @param callback_
 * @returns {*}
 */
exports.update = function(handler, callback_) {

      var uid_=handler.user._id
       ,company_=handler.params.body_company;
  handler.addParams("domain",company_.domain);
  handler.addParams("cid",company_.id);
  handler.addParams("type",company_.type);
  handler.addParams("extend",company_.extend);
  handler.addParams("name",company_.name);
  handler.addParams("uid",uid_);
  handler.addParams("createAt",new Date());

  company.update(handler, function(err, result){
    if (err) {
      return callback_(new error.InternalServer(err));
    }
    return callback_(err, result);
  });
};

exports.active= function(handler, callback_) {

  handler.code = handler.params.code;
  handler.addParams("name",handler.params.name);
  handler.addParams("domain",handler.params.domain);
  handler.addParams("type",handler.params.type);
  handler.addParams("extend",handler.params.extend);
  handler.addParams("updateBy", handler.req.session.user._id);
  handler.addParams("cid", handler.params.id);

    company.update(handler, function(err, result) {
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
