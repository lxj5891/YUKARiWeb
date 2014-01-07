/**
 * Created by zhaobing on 14/01/06.
 */
var appImage_  =require('../controllers/ctrl_appImage')
    ,context     =smart.framework.context
    ,response  =smart.framework.response;

exports.save = function(req_, res_){

  var handler = new context().bind(req_,res_);

  appImage_.save(handler,function(err,result){
    response.send(res_,err,result);
  });
}