var json      = smart.framework.response
  , errors    = smart.framework.errors
  , context   = smart.framework.context
  , response  = smart.framework.response
  , auth      = smart.framework.auth
  , util      = smart.framework.util
  , user      = require('../controllers/ctrl_user');


//yukari
exports.list = function(req_, res_) {

  var handler=new context().bind(req_, res_);
  user.getList(handler,function(err,result){
    response.send(res_, err, result);
  });
};

exports.add = function(req_, res_) {
  var handler=new context().bind(req_, res_);
  user.add(handler, function(err, result) {
    response.send(res_, err, result);
  });
};

exports.update = function(req_, res_) {
  var handler=new context().bind(req_, res_);
  user.update(handler, function(err, result) {
    response.send(res_, err, result);
  });
};
exports.updateActive = function(req_,res_){
  var handler=new context().bind(req_, res_);
  user.updateActive(handler, function(err, result) {
    response.send(res_, err, result);
  });
};
// 获取指定用户
exports.searchOne = function(req_, res_) {
  var handler=new context().bind(req_, res_);

  user.searchOne(handler,function(err,result){
    response.send(res_,err,result);
  });

};

exports.simpleLogin = function(req_, res_){
  var handler=new context().bind(req_, res_);
  user.simpleLogin(handler,function(err,result){
    response.send(res_, err, result);
  });
};

exports.simpleLogout = function(req_, res_){
  auth.simpleLogout(req_, res_);
  if (util.isBrowser(req_)) {
    return res_.redirect("/login");
  }
  response.send(res_, undefined, "success");
};
/**
 * 检索用户
 */
exports.searchuser = function(req,res){
  var handler = new context().bind(req,res);

  user.searchuser(handler,function(err,result){
    response.send(res,err,result);
  })
}

/**
 * 下载模板（zhaobing）
 */
exports.downloadTemp = function(req_, res_) {
  user.downloadTemp(req_, res_);
};

/**
 * 导入csv（zhaobing）
 */
exports.import = function(req_, res_) {
  user.import(req_, res_);
};