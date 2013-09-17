var json = lib.core.json
  , user = lib.mod.user
  , crl_user =lib.ctrl.user
  , _ = require('underscore')
  , sync     = require('async')
  , company = require('../modules/mod_company');
//yukri
exports.adminlist = function(uid_,callback) {
    company.find({active:1,valid:1},function(err,comps) {
       if(err) {
           return callback_(new error.InternalServer(err));
       } else {
         var allUserList= [];
         var allUserFunc = function(comp_,sub_callback){
           user.find(comp_.code,{active:1,valid:1,createby:uid_},function(err,userList){
             if(err) {
               sub_callback(err);
             } else {
               if (userList.length >0) {
                 _.each(userList,function(user){
                    user._doc.path = comp_.path;
                 });
                 allUserList = allUserList.concat(userList);
               }
               sub_callback(err);
             }
           });
         };
         sync.forEach(comps, allUserFunc, function(err){
          callback(err, allUserList);
         });
       }
    });
};
exports.add = function(uid_, data_, callback_) {
  var dbName = data_.companycode;
  crl_user.addByDBName(dbName,uid_, data_, function(err, result) {
    if (err) {
      return callback_(new error.InternalServer(err));
    } else {
      return callback_(err, result);
    }
  });
};
exports.update = function(uid_, data_, callback_) {
  var dbName = data_.companycode;
  crl_user.updateByDBName(dbName,uid_, data_, function(err, result) {
    if (err) {
      return callback_(new error.InternalServer(err));
    } else {
      return callback_(err, result);
    }
  });
};