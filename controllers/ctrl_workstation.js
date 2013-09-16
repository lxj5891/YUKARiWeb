var _         = require('underscore')
  , workstation       = require('../modules/mod_workstation.js')
  , async     = require('async');

exports.save = function(code_, uid_, workstation_, callback_){
  var now = new Date();
  workstation_.createat = now;
  workstation_.createby = uid_;
  workstation_.editat = now;
  workstation_.editby = uid_;
  var workstationId = workstation_.id;
  delete workstation_.id;

  if (workstationId) {

    workstation.update(code_, workstationId, workstation_, function(err, result){
      if (err) {
        return callback_(new error.InternalServer(err));
      }

      callback_(err, result);
    });
  } else {

    workstation.add(code_, workstation_, function(err, result){
      if (err) {
        return callback_(new error.InternalServer(err));
      }

      callback_(err, result);
    });
  }
};

exports.get = function(code_, user_, workstationId_, callback_){

  workstation.one(code_, workstationId_, function(err, result){
    if (err) {
      return callback_(new error.InternalServer(err));
    }

    callback_(err, result);
  });
};

exports.remove = function(code_, user_, workstationId_ , callback_){

  workstation.remove(code_, user_, workstationId_, function(err, result){
    if (err) {
      return callback_(new error.InternalServer(err));
    }
    callback_(err, result);
  });
};

exports.list = function(code_, user, callback_) {

  var condition = {valid: 1};

  workstation.list(code_, condition, function(err, result){
    if (err) {
      return callback_(new error.InternalServer(err));
    }

    callback_(err, {items:result});
  });
};

function check_auth(user) {
  //権限チェック TODO
}