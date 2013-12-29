var json      = smart.framework.response
  , errors    = smart.framework.errors
  , context   = smart.framework.context
  , response  = smart.framework.response
  , auth      = smart.framework.auth
  , util      = smart.framework.util
  , user      = require('../controllers/ctrl_user');


//yukari
exports.list = function(req_, res_) {
  var start = req_.query.start
    , limit = req_.query.count
    , keyword = req_.query.keyword
    , dbName = req_.session.user.companycode
  user.listByDBName(dbName,start, limit, keyword, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};
// 获取指定用户
exports.searchOne = function(req_, res_) {

  var userid = req_.query.userid
    , dbName = req_.session.user.companycode;

  user.searchOneByDBName(dbName,userid, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
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
