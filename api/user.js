var json      = smart.framework.response
  , errors    = smart.framework.errors
  , log       = smart.framework.log
  , auth     = smart.framework.auth
  , response    = smart.framework.response
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
exports.simpleLogin = function(req, res){
  var deivceId = req.query.deviceid;
  var logined = function() {
    if (req.session.user.type == 1) // 重新设定管理员画面
      req.query.home = "/admin";
    //
  };
  var path = req.query.path; // 公司ID, Web登陆用
  var code = req.query.code; // 公司Code，iPad登陆用
  // 登陆到公司的DB进行Login
  if(path) {
    ctrl_company.getByPath(path, function(err, comp){
      if(err)
        return errorsExt.sendJSON(res, err);
      if(!comp)
        return errorsExt.sendJSON(res, errorsExt.NoCompanyID);
      // var companyDB = comp.code;
      req.query.companycode= comp.code;
    })
    // iPad登陆
  } else if(code) {
    ctrl_company.getByCode(code, function(err, comp){
      if(err)
        return errorsExt.sendJSON(res, err);
      if(!comp)
        return errorsExt.sendJSON(res, errorsExt.NoCompanyCode);
      var companyDB = comp.code;
      req.query.companycode = code;
    });
  }

////////////////////////////////////////////////////////////////////////
  log.debug("user name: " + req.query.name);

  // パスワードのsha256文字列を取得する
  req.query.password = auth.sha256(req.query.password);

  // 認証処理
  auth.simpleLogin(req, res, function(err, result) {

    if (err) {
      log.error(err, undefined);
      log.audit("login failed.", req.query.name);
    } else {
      log.audit("login succeed.", result._id);
    }

    response.send(res, err, result);
  });
};
//////////////////////////////////////////////////////////////////////////////////////////
