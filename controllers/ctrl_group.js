/**
 * Created by Wuql on 13/12/30.
 */
var group = smart.ctrl.group
  , log = smart.framework.log
  , error = smart.framework.errors
  , async = smart.util.async
  , user = smart.ctrl.user
  , context = smart.framework.context
  , util = smart.framework.util;

//获取组一览
exports.list = function(handler,callback){
  var condition = {valid:1};
  if(handler.params.keyword){
      condition.$or = [{ "name": new RegExp(handler.params.keyword.toLowerCase(), "i") }
      ,{ "extend.letter_zh": new RegExp(handler.params.keyword.toLowerCase(), "i") }];
  }
  handler.addParams("condition",condition);
  group.getList(handler,function(err,result){
    if(err){
      log.error(err,handler.uid);
      return callback(new error.NotFound(__("js.ctr.common.system.error")));
    }else{
      return callback(err,result);
    }
  });
};

//创建组
//edit by wuql at 20131231
exports.createGroup = function (handler,callback) {
  handler.addParams("type",1);
  handler.addParams("visibility","2");
//验证添加的组成员是否为空
  if(handler.params.extend.member == undefined || handler.params.extend.member.length < 1){
    return callback(new error.BadRequest(__("js.public.check.group.member")));
  }
//把当前用户也默认添加到该组中
  handler.params.extend.member.push(handler.req.session.user._id);
  group.add(handler,function(err,result){
    if(err){
      log.error(err,handler.uid);
      return callback(new error.NotFound(__("js.ctr.common.system.error")));
    }
    else{
      return callback(err,result);
    }
  });
}

/**
 * 获取组的成员一览
 * Created by wuql on 14/01/02
 */
exports.getGroupWithMemberByGid = function(handler,callback){
  group.get(handler,function(err,result){
      if(err){
        log.error(err,handler.uid);
        return callback(new error.NotFound(__("js.ctr.common.system.error")));
      }else{
        var userhandler = new context().create("",handler.code,"");

        userhandler.code = handler.code;
        var condition = { "_id":{"$in": result.extend.member} };
        userhandler.addParams("condition",condition);
        user.getList(userhandler,function(err,userresult){
          if(err){
            log.error(err,handler.uid);
            return callback(new error.NotFound(__("js.ctr.common.system.error")));
          }else{
            result._doc.users = userresult.items;
            callback(err,result);
          }
        });
      }
    }
  )
}

/**
 * 更新组信息
 * Created by wuql on 14/01/02
 */
exports.updateGroup = function(handler,callback){
  handler.addParams("gid",handler.params._id);
  //验证添加的组成员是否为空
  if(handler.params.extend.member == undefined || handler.params.extend.member.length < 1){
    return callback(new error.BadRequest(__("js.public.check.group.member")));
  }
  group.update(handler,function(err,result){
    if(err){
      log.error(err,handler.uid);
      return callback(new error.NotFound(__("js.ctr.common.system.error")));
    }
    else{
      return callback(err,result);
    }
  });
}