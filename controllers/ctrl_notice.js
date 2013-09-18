var _         = require('underscore')
  , async     = require('async')
  , notice    = require('../modules/mod_notice.js')
  , mq        = require('./ctrl_mq')
  , user      = lib.ctrl.user
  , mod_user  = lib.mod.user
  , group     = lib.ctrl.group
  , error     = lib.core.errors
  , util      = lib.core.util;

var EventProxy = require('eventproxy');

exports.getNoticeById = function(code_, notice_id, callback){
  notice.findOne(code_, notice_id, function(err,docs){
    callback(err, docs);
  });
};

// get list
exports.list = function(code_, keyword_, start_, limit_, callback_) {

  var start = start_ || 0
    , limit = limit_ || 20
    , condition = {valid: 1};

  if(keyword_){
    keyword_ = util.quoteRegExp(keyword_);
    condition.title = new RegExp(keyword_.toLowerCase(),"i");
  }

  notice.total(code_, condition, function(err, count){
    if (err) {
      return callback_(new error.InternalServer(err));
    }

    notice.list(code_, condition, start, limit, function(err, result){
      if (err) {
        return callback_(new error.InternalServer(err));
      }

      var subTask = function(item, subCB){

        async.parallel({
          user: function (callback2) {

            user.listByUids(code_, item.touser, 0, 20, function(err, u_result) {
              callback2(err, u_result);
            });
          },
          group: function (callback2) {
            group.listByGids(code_, item.togroup, 0, 20, function(err, g_result) {
              callback2(err, g_result);
            });
          }
        }, function(errs, results) {
          item._doc.sendto = results;
          subCB(errs);
        });

      };

      async.forEach(result, subTask, function(err_){
        user.appendUser(code_, result, "createby", function(err){
          return callback_(err, {items:result, totalItems: count});
        });
      });
    });
  });
};
function getUidByUserid(code, userIds, callback) {

  var ep = new EventProxy();
  var uid_list = [];

  ep.after('user_ready', userIds.length, function () {
    return callback(null, uid_list);
  });

  ep.fail(callback);

  userIds.forEach(function (u_id, i) {

    mod_user.get(code, u_id, function (err, user_docs) {
      uid_list[i] = user_docs.uid;
      console.log(user_docs.uid);
      ep.emit('user_ready');
    });

  });

};

exports.add = function (code_, uid_, notice_, callback_) {

  var useridlist = notice_.user.split(",");
  getUidByUserid(code_,useridlist ,function(err,notice_userUids){
    var obj = {
      valid: 1
      , createat: new Date()
      , createby: uid_
      , notice: notice_.notice
      , title: notice_.title
      , touser: notice_.user ? notice_.user.split(",") : []
      , togroup: notice_.group ? notice_.group.split(",") : []
    }

    notice.add(code_, obj, function (err, result) {
      if (err) {
        return callback_(new error.InternalServer(err));
      }

      // send apn notice
      _.each(notice_userUids, function (u) {
        mq.pushApnMessage({
          code: code_
          , target: u
          , body: result.title
          , type : "notice"
        });
      });

      return callback_(err, result);
    });

  });


};
