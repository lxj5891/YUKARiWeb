/**
 * Created by Wuql on 13/12/30.
 */
/**
 * API Group
 * Copyright (c) 2012 Author Name dd_dai
 */

var response = smart.framework.response
  , context = smart.framework.context
  , group = require("../controllers/ctrl_group")

//获取一览
exports.list = function(req_, res_) {
  var handler = new context().bind(req_,res_);

  group.list(handler,function(err,result){
    response.send(res_,err,result);
  });
};

//创建组
//Created by wuql on 13/12/31
exports.createGroup = function (req_, res_) {
  var handler = new context().bind(req_,res_);

  group.createGroup(handler,function(err,result){
    response.send(res_,err,result);
  })
};