/**
 * Created by Wuql on 13/12/30.
 */
var group = smart.ctrl.group
  , log = smart.framework.log
  , error = smart.framework.errors
  , util = smart.framework.util;

//获取组一览
exports.list = function(handler,callback){
  var condition = {valid:1};
  if(handler.params.keyword){
    var keyword = util.quoteRegExp(keyword);
    condition.$or = [
      {"name": keyword}
      , {"extend.letter_zh":keyword}
    ]
  }
  handler.addParams("condition",condition);
  group.getList(handler,function(err,result){
    if(err){
      log.error(err,handler.uid);
      return callback(new error.NotFound("js.ctr.common.system.error"));
    }else{
      return callback(err,result);
    }
  });
};

//创建组
//edit by wuql at 20131231
exports.createGroup = function (handler,callback) {

  group.add(handler,function(err,result){
    if(err){
      log.error(err,handler.uid);
      return callback(new error.NotFound("js.ctr.common.system.error"));
    }
    else{
      return callback(err,result);
    }
  })
}