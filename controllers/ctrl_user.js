var json = lib.core.json
  , user = lib.mod.user
  , util = lib.core.util
  , _ = require('underscore')
  , sync     = require('async')
  , company = require('../modules/mod_company');
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
