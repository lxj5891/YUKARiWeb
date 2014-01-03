var _         = smart.util.underscore
  , async     = smart.util.async
  , notice    = require('../modules/mod_notice.js')
  , mq        = require('./ctrl_mq')
  , user      = smart.ctrl.user
  , group     = require('./ctrl_group')
  , smartgroup = smart.ctrl.group
  , error     = smart.framework.errors
  , context = smart.framework.context
  , util      = smart.framework.util;

//var EventProxy = require('eventproxy');

exports.getNoticeById = function(code_, notice_id, callback){
  notice.findOne(code_, notice_id, function(err,docs){
    callback(err, docs);
  });
};

// get list
//exports.list = function (code_, keyword_, start_, limit_, callback_) {
exports.list = function (handler, callback_) {
  var params = handler.params;
  var start = params.start_ || 0
    , limit = params.limit_ || 20
    , condition = {valid: 1};

  if (params.keyword_) {
//    keyword_ = util.quoteRegExp(keyword_);
    condition.title = new RegExp(params.keyword_.toLowerCase(), "i");
  }

  notice.total(handler.code, condition, function (err, count) {
    if (err) {
      return callback_(new error.InternalServer(err));
    }

    notice.getList(handler.code, condition, start, limit, function (err, result) {
      if (err) {
        return callback_(new error.InternalServer(err));
      }
      var subTask = function (item, subCB) {

        async.parallel({
          user: function (callback2) {
            var userhandler = new context().create(handler.uid,handler.code,"");
            userhandler.code = handler.code;
            userhandler.addParams("condition",{"_id":{"$in":item.touser}});
            user.getList(userhandler,function(err,u_result){
                if(err){
                  log.error(err,handler.uid);
                  return callback(new error.NotFound(__("js.ctr.common.system.error")));
                }else{
              callback2(err, u_result.items);
                }
            });
          },
          group: function (callback2) {
            var grouphandler = new context().create(handler.uid,handler.code,"");
            grouphandler.code = handler.code;
            grouphandler.addParams("condition",{"_id":{"$in":item.togroup}});
            smartgroup.getList(grouphandler, function (err, g_result) {
              if(err){
                log.error(err,handler.uid);
                return callback(new error.NotFound(__("js.ctr.common.system.error")));
              }else{
              callback2(err, g_result.items);
              }
            });
          }
        }, function (errs, results) {
          item._doc.sendto = results;
          subCB(errs);
        });
      };

      async.forEach(result, subTask, function (err_) {
        user.appendUser(handler.code, result, "createby", function (err) {
          return callback_(err, {items: result, totalItems: count});
        });
      });
    });
  });
};

//exports.add = function(code_, uid_, notice_, callback_) {
exports.add = function(handler, callback) {
  var params = handler.params;
  var obj = {
    valid: 1
    , createat: new Date()
    , createby: handler.uid
    , notice: params.notice
    , title: params.title
    , touser: params.user ? params.user.split(",") : []
    , togroup: params.group ? params.group.split(",") : []
  };

  var userList = [];
  var tasks = [];
//检索group中的member
  tasks.push(function(callback){
  //处理group
    async.forEach(obj.togroup
    ,function(id, subCB){
      handler.addParams("gid",params.group);
      group.getGroupWithMemberByGid(handler,function(err_, result_) {
        userList = _.union(userList, result_._doc.users);
        subCB(err_);
      });
    }
    , function(err_){
      if (err_) {
        return callback(new error.InternalServer(err_));
      }
    })
    return callback(null);
  });

  tasks.push(function(callback){
    if (obj.touser) {
      var userhandler = new context().create(handler.uid,handler.code,"ja");
      userhandler.addParams("condition",{"_id":handler.uid});
      user.getList(userhandler,function(err,users){
        if (err) {
          return callback(new errors.InternalServer(err));
        }
        userList = _.union(userList, users);
      });
    }
    return callback(null);
  })

  tasks.push(function(callback){
    var toList = [];
    _.each(userList, function(user) {
      toList.push(user.uid);
    });
  //查重
    toList = _.uniq(toList);
    notice.add(handler.code, obj, function(err, resultnotice){
      if (err) {
        return callback(new error.InternalServer(err));
      }
      //!!!发送通知部分没解决
      // send apn notice
      _.each(toList, function(uid){
        mq.pushApnMessage({
          code: handler.code
          , target: uid
          , body: resultnotice.title
          , type : "notice"
        });
      });
      return callback(null);
    });
  })

  async.waterfall(tasks,function(err,result){
    return callback(err,userList);
  })
};
