//var smart     = require("smartcore")
//  , json      = smart.core.json
//  , user      = smart.mod.user
  var util      = smart.framework.util
  , _         = smart.util.underscore
  , sync      = smart.util.async
  , response    = smart.framework.response
  , auth     = smart.framework.auth
  , log       = smart.framework.log
  , company   = smart.ctrl.company


// added by wuql from api/user edit by zhaobing
exports.simpleLogin = function(req, res){
  var deivceId = req.query.deviceid;
  var logined = function() {
    if (req.session.user.type == 1) // 重新设定管理员画面
      req.query.home = "/admin";
  };
  var path = req.query.path; // 公司ID, Web登陆用
  var code = req.query.code; // 公司Code，iPad登陆用
  // 登陆到公司的DB进行Login
  if(path) {
//    ctrl_company.getByPath(path, function(err, comp){
//      if(err)
//        return errorsExt.sendJSON(res, err);
//      if(!comp)
//        return errorsExt.sendJSON(res, errorsExt.NoCompanyID);
      // var companyDB = comp.code;
      req.query.code= "4e7ad44a";
//    })
    // iPad登陆
  } else if(code) {
    ctrl_company.getByCode(code, function(err, comp){
      if(err)
        return errorsExt.sendJSON(res, err);
      if(!comp)
        return errorsExt.sendJSON(res, errorsExt.NoCompanyCode);
//      var companyDB = comp.code;
      req.query.companycode = code;
    });
  }

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


//yukri
exports.listByDBName = function(dbName_,start_, limit_, keyword_, callback_) {

  var start = start_ || 0
    , limit = limit_ || 20
    , condition = {
      valid: 1
    }
    , dbName =  dbName_;
  if (keyword_) {
    keyword_ = util.quoteRegExp(keyword_);
    condition.$or = [
      {"name.name_zh": new RegExp(keyword_.toLowerCase(), "i")}
      ,
      {"name.letter_zh": new RegExp(keyword_.toLowerCase(), "i")}
    ]
  }
  user.totalByDBName(dbName,condition, function (err, count) {
    if (err) {
      return callback_(new error.InternalServer(err));
    }
    user.listByDBName(dbName,condition, start, limit, function (err_, result) {
      if (err_) {
        return callback_(new error.InternalServer(err_));
      } else {

        result = transUserResult(result);

        var compFunc = function(user_,sub_callback){
          user.searchOneByDBName(dbName,user_._doc.createby,function(err_c,edituser){
            if(err_c) {
              sub_callback(err_c);
            } else {
              if (edituser) {
                user_._doc.code = edituser._doc.companycode;
              } else {
                user_._doc.code = "";
              }
              sub_callback(err_c);
            }
          });
        };
        sync.forEach(result, compFunc, function(err__){
          callback_(err__, {totalItems: count, items: result});
        });
      }
    });
  });
};
exports.searchOneByDBName = function(dbName_, uid_, callback_) {
  company.getByCode(dbName_,function(err_c,comp_){
    if(err_c) {
      callback_(err_c);
    } else {
      if (uid_ != "") {
        user.searchOneByDBName(dbName_,uid_, function(err, result){
          if (err) {
            return callback_(new error.InternalServer(err));
          } else {
            return callback_(err,{comp:comp_,item:result});
          }

        });
      } else {
        return callback_(err_c,{comp:comp_,item:null});
      }
    }
  });

};

function transUserResult(result) {
    var resultold;
  resultold.name.name_zh = result.expand.name_zh

  return resultold;
}
