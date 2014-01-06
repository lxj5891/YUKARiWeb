var _           = smart.util.underscore
  , workstation = require('../modules/mod_workstation.js')
  , context   = smart.framework.context
  , async       = smart.util.async
  , user        = smart.ctrl.user
  , group       = smart.ctrl.group
  , error       = smart.framework.errors
  , utils       = require('../core/utils');

exports.save = function(handler, callback_){

  var workstation_=handler.req.body
      ,uid_=handler.req.session.user._id
      ,code_=handler.code;
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

      workstation.add(code_, ws, function(err, result){
        if (err) {
          return callback_(new error.InternalServer(err));
        }

        callback_(err, result);
      });
    });
  }
};

exports.saveList = function(handler, callback_) {
  var workstationList_=handler.req.body
    ,uid_=handler.req.session.user._id
    ,code_=handler.code;

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

exports.get = function(handler, callback_){
  var code_=handler.code
     ,user_=handler.req.session.user
     , workstationId_=handler.req.query.id;

  workstation.get(code_, workstationId_, function(err, result){
    if (err) {
      return callback_(new error.InternalServer(err));
    }
//code_, user_._id
    handler.addParams("condition",user_._id);
    group.getList(handler, function(err, groups){
      if(err){
        return callback_(new error.InternalServer(err));
      }

      if(!canView(user_,groups,result)){
        return callback_(new error.Forbidden(__("js.common.access.check")));
      }

      async.parallel({
        user: function (callback2) {

          var userhandler = new context().create("",handler.code,"");
          var condition = { "_id":{"$in": result.touser} };
          userhandler.addParams("condition",condition);
          user.getList( userhandler, function(err, u_result) {
            callback2(err, u_result);
          });
        },
        group: function (callback2) {

          var grouphandler = new context().create("",handler.code,"");
          var condition = { "_id":{"$in": result.togroup} };
          grouphandler.addParams("condition",condition);
          group.getList( grouphandler, function(err, g_result) {
            callback2(err, g_result);
          });
        }
      }, function(errs, results) {
        result._doc.to = results;
        callback_(errs, result);
      });
    });

  });
};

exports.remove = function(handler, callback_){
  var code_=handler.code
     , workstationId_=handler.req.body.id;
  console.log(handler.req.session.user._id);
  workstation.remove(code_, handler.uid, workstationId_, function(err, result){
    if (err) {
      return callback_(new error.InternalServer(err));
    }
    callback_(err, result);
  });
};

exports.list = function(handler, callback_) {
  var user_=handler.req.session.user;
  var code_ = handler.code;
  var condition = {valid: 1};
//code_, user_._id,
  handler.addParams("condition",handler.req.session.user._id);
  group.getList(handler, function(err, groups){
    if(err){
      return callback_(new error.InternalServer(err));
    }


    if(utils.hasContentPermit(user_)||utils.isAdmin(user_)){

    } else {
      var or = [];
      or.push({"open":0});
      if(groups.length > 0){
        _.each(groups, function(g){
          or.push({"togroup":g._id.toString()});
        });
      }
      or.push({"touser":user_._id});
      condition.$or = or;
    }

    workstation.getList(code_, condition, function(err, result){
      if (err) {
        return callback_(new error.InternalServer(err));
      }

      callback_(err, {items:result});
    });
  });
};

function canView(user_, joinGroup_, workstation_){
  if(utils.hasContentPermit(user_)||utils.isAdmin(user_)){
    return true;
  }
  if(workstation_.open == 0){
    return true;
  }

  if(_.contains(workstation_.touser, user_._id)){
    return true;
  }

  for(var i = 0; i < joinGroup_.length; i ++){
    var gid = joinGroup_[i]._id.toString();
    if(_.contains(workstation_.togroup, gid)){
      return true;
    }
  }

  return false;
}