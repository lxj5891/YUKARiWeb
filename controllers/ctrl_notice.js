var _         = require('underscore')
  , async     = require('async')
  , notice    = require('../modules/mod_notice.js')
  , mq        = require('./ctrl_mq')
  , user      = lib.ctrl.user
  , group     = lib.ctrl.group
  , error     = lib.core.errors
  , util      = lib.core.util;

exports.getNoticeById = function(code_, notice_id, callback){
  notice.findOne(code_, notice_id, function(err,docs){
    callback(err, docs);
  });
};

// get list
exports.list = function(code_, keyword_,company_, start_, limit_, callback_) {

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

exports.add = function(code_, uid_, notice_, callback_) {

  var obj = {
      valid: 1
    , createat: new Date()
    , createby: uid_
    , notice: notice_.notice
    , title: notice_.title
    , touser: notice_.user ? notice_.user.split(",") : undefined
    , togroup: notice_.group ? notice_.group.split(",") : undefined
  }

  notice.add(code_, obj, function(err, result){
    if (err) {
      return callback_(new error.InternalServer(err));
    }

    // send apn notice
    _.each(result.touser, function(u){
      mq.pushApnMessage({
          code: coee_
        , target: u
        , body: result.title
      });
    });

    return callback_(err, result);
  });

};
