var _         = require('underscore')
  , workstation       = require('../modules/mod_workstation.js')
  , async     = require('async')
  , user      = lib.ctrl.user
  , group     = lib.ctrl.group
  , error     = lib.core.errors;

exports.save = function(code_, uid_, workstation_, callback_){
  var now = new Date();

  var ws = {
    icon : workstation_.icon,
    title: workstation_.title,
    url  :workstation_.url,
    type :workstation_.type,
    open :workstation_.open,
    editat: now,
    editby: uid_,
    touser: (workstation_.open == 1 && workstation_.user) ? workstation_.user.split(",") : [] ,
    togroup: (workstation_.open == 1 && workstation_.group) ? workstation_.group.split(",") : []
  };

  var wsid = workstation_.id;

  if (wsid) {

    workstation.update(code_, wsid, ws, function(err, result){
      if (err) {
        return callback_(new error.InternalServer(err));
      }

      callback_(err, result);
    });
  } else {
    ws.createat = now;
    ws.createby = uid_;

    workstation.total(code_, {valid: 1}, function(err, count){
      ws.sort_level = count + 1;
    });

    workstation.add(code_, ws, function(err, result){
      if (err) {
        return callback_(new error.InternalServer(err));
      }

      callback_(err, result);
    });
  }
};

exports.saveList = function(code_, uid_, workstationList_, callback_) {

  var subTask = function(item, callback_){
    var info = item.split(":");

    workstation.update(code_, info[1], {sort_level: info[0], editby: uid_, editat: new Date()}, function(err, result){
      if (err) {
        return callback_(new error.InternalServer(err));
      }

      callback_(err, result);
    });
  };

  async.forEach(workstationList_, subTask, function(err_, result_){
    if (err_) {
      return callback_(new error.InternalServer(err_));
    }

    callback_(err_, result_);
  });

};

exports.get = function(code_, user_, workstationId_, callback_){

  workstation.one(code_, workstationId_, function(err, result){
    if (err) {
      return callback_(new error.InternalServer(err));
    }

    async.parallel({
      user: function (callback2) {

        user.listByUids(code_, result.touser, 0, 20, function(err, u_result) {
          callback2(err, u_result);
        });
      },
      group: function (callback2) {
        group.listByGids(code_, result.togroup, 0, 20, function(err, g_result) {
          callback2(err, g_result);
        });
      }
    }, function(errs, results) {
      result._doc.to = results;
      callback_(errs, result);
    });

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