var json      = smart.framework.response
  , errors    = smart.framework.errors

  , user      = require('../controllers/ctrl_user')
  , util      = require('../core/utils');


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
//////edit by zhaobing//////////////////////////////////////////////////////////////////////////////////////////
///remove to controllers
exports.simpleLogin = function(req, res){
  user.simpleLogin(req,res);
};
