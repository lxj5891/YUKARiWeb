var json      = smart.framework.response
  , errors    = smart.framework.errors
  ,context    =smart.framework.context
  ,response   = smart.framework.response
  , setting   = require('../controllers/ctrl_setting')
  , utils     = require('../core/utils');




exports.updateAppimage = function (req_, res_) {

  var handler=new context().bind(req_, res_);

  if(!canUpdate(req_.session.user)){
    return noUpdateResponse(res_);
  }

  setting.updateAppimage(handler, function (err, result) {
    response.send(res_, err, result);
  });


};

exports.getAppimage = function (req_, res_) {
//  if(!canUpdate(req_.session.user)){
//    return noUpdateResponse(res_);
//  }

  var handler=new context().bind(req_, res_);

  setting.getAppimage(handler,function(err,result){
    response.send(res_, err, result);
  });
};

function canUpdate(user_){
  return utils.hasContentPermit(user_) || utils.isAdmin(user_);
}

function noUpdateResponse(res_){
  var err= new errors.Forbidden(__("js.common.update.check"));
  response.send(res_, err, result);
}