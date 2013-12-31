//var smart     = require("smartcore")
//  , json      = smart.core.json
//  , user      = smart.mod.user
  var util      = smart.framework.util
  , _         = smart.util.underscore
  , sync      = smart.util.async
  , response  = smart.framework.response
  , auth      = smart.framework.auth
  , log       = smart.framework.log
  , company   = smart.ctrl.company
  , crl_user  = smart.ctrl.user
  , error     = smart.framework.errors
  , context   = smart.framework.context;


exports.simpleLogin = function(handler,callback_){
  var domain = handler.params.domain; // 公司ID, Web登陆用
  var code   = handler.params.code;   // 公司Code，iPad登陆用
  handler.req.query.password = auth.sha256(handler.params.password);

  if(domain){
    auth.simpleLogin(handler.req,handler.res,function(err,result){
      if(result && result.extend.active != 1){
        callback_(new error.NotFound(__("user.error.notExist")));
      }else{
        callback_(err,result);
      }
    });
  }else if(code){
      company.getByCode(handler,function(err,comp){
         if(err){
           callback_(err);
         }else{
           handler.req.query.domain = comp.domain;
           auth.simpleLogin(handler.res,handler.req,function(err_,result){
             if(result && result.extend.active != 1){
               callback_(new error.NotFound(__("user.error.notExist")));
             }else{
               callback_(err_,result);
             }
           });
         }

      });
  }else{
    auth.simpleLogin(handler.req,handler.res,function(err,result){
      callback_(err,result);
    });

  }
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
