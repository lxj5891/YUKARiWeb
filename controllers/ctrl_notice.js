var _         = require('underscore')
  , async     = require('async')
  , notice    = require('../modules/mod_notice.js')
  , mq        = require('./ctrl_mq')
  , user      = lib.ctrl.user
  , error     = lib.core.errors;

var EventProxy = require('eventproxy');

exports.getNoticeById = function(notice_id,callback){
  notice.findOne(notice_id,function(err,docs){
    callback(err,docs);
  });
};

// get list
exports.list = function(company_, start_, limit_, callback_) {

    var start = start_ || 0
        , limit = limit_ || 20
        , condition = {valid: 1};

    notice.list(condition, start, limit, function(err, result){
        if (err) {
            return callback_(new error.InternalServer(err));
        }

        var subTask = function(item, subCB){
            user.listByUids(item.touser, 0, 20, function(err, u_result) {
                item._doc.sendto = u_result;
                subCB(err);
            });
        };
        async.forEach(result, subTask, function(err_){

            user.appendUser(result, "createby", function(err, result){
                return callback_(err, {items:result});
            });
        });
    });
};

exports.add = function(uid_, notice_, callback_) {

  var obj = {
      valid: 1
    , createat: new Date()
    , createby: uid_
    , notice: notice_.notice
    , title: notice_.title
    , touser: notice_.user ? notice_.user.split(",") : undefined
    , togroup: notice_.group ? notice_.group.split(",") : undefined
  }

  notice.add(obj, function(err, result){
    if (err) {
      return callback_(new error.InternalServer(err));
    }

    // send apn notice
    result.touser
    _.each(result.touser, function(u){
      console.log(u);
      console.log(result.title)
      mq.pushApnMessage({
        target: u
        , body: result.title
      });
    });

    return callback_(err, result);
  });

};
