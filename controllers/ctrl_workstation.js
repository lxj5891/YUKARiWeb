var _         = require('underscore')
  , workstation       = require('../modules/mod_workstation.js')
  , async     = require('async');

exports.save = function(code_, uid_, workstation_, callback_){
  var now = new Date();
  workstation_.createat = now;
  workstation_.createby = uid_;
  workstation_.editat = now;
  workstation_.editby = uid_;

  workstation.save(code_, workstation_, function(err, result){
    if (err) {
      return callback_(new error.InternalServer(err));
    }

    callback_(err, result);
  });
};

exports.get = function(code_, callback_){
  workstation.one(code_, function(err, result){
    if (err) {
      return callback_(new error.InternalServer(err));
    }

    callback_(err, result);
  });
};