var  json     = smart.framework.response
//  , user      = smart.mod.user
  , crl_user  = smart.ctrl.user
  , error     = smart.framework.errors
  , _         = smart.util.underscore
  , sync      = smart.util.async
  , check     = smart.util.validator.check
  , auth      = smart.framework.auth
  , company   = smart.ctrl.company;
var FAKE_PASSWORD = "000000000000000000000";
//yukri
exports.adminlist = function(handler,callback) {

  handler.addParams("limit",Number.MAX_VALUE);
  handler.addParams("condition",{valid:1});
  handler.addParams("order",{editat: 'desc'});

  company.getList(handler,function(err,result) {
    var comps = result.items;
    for(var k in comps){
      comps[k].kindex = k;
    }
    if(err) {
      return callback(new error.InternalServer(err));
    } else {
      var allUserList= [];
      var comUserList = [];
      var allUserFunc = function(comp_,sub_callback){
        handler.addParams("_code",comp_.code);
        handler.addParams("condition",{valid:1,createBy:handler.uid});
        crl_user.getList(handler,function(err,result){
          var userList = result.items;
          if(err) {
            sub_callback(err);
          } else {
            if (userList.length >0) {
              _.each(userList,function(user){
                user._doc.path = comp_.domain;
                user._doc.companycode = comp_.code;
              });
              comUserList[comp_.kindex] = userList;
            }
            sub_callback(err);
          }
        });
      };
      sync.forEach(comps, allUserFunc, function(err){
        for(var j in comUserList){
          allUserList = allUserList.concat(comUserList[j]);
        }
        callback(err, allUserList);
      });
    }
  });
};
exports.adminsearchOne = function(handler,callback_) {

  var code = handler.params.code;
  handler.addParams("_code",code);


  crl_user.get(handler,function(err,result){
    if (err) {
      return callback_(err);
    }
    company.getByCode(handler,function(err,comps){
      if(err) {
        return callback_(new error.InternalServer(err));
      } else {
        if (comps) {
          result._doc.companypath = comps._doc.path;
          result._doc.companycode = comps._doc.code;
          result.password = FAKE_PASSWORD;
        }
        return callback_(err,result);
      }
    });
  });
};
exports.add = function(handler, callback_) {
  handler.params.extend.type = 0;

  var user = handler.params;
  handler.addParams("_code",user.companycode);

  checkUser(user,function(checkErr){
    if(checkErr){
      callback_(checkErr);
    }else{
      handler.params.password = auth.sha256(user.password );
      crl_user.add(handler,function(err,result){
        return callback_(err, result);
      });
    }

  });

};
exports.update = function(handler,callback_) {

  var user = handler.params;
  handler.addParams("_code",user.companycode);
  checkUser(user,function(checkErr){
    if(checkErr){
      callback_(checkErr);
    }else{
      if(user.password != undefined){
        handler.params.password = auth.sha256(user.password );
      }
      crl_user.update(handler,function(err,result){
        return callback_(err, result);
      });
    }
  });
};

exports.updateActive = function(handler,callback_) {

  var user = handler.params;
  handler.addParams("_code",user.companycode);
  handler.params.extendValue = parseInt(handler.params.extendValue);
  crl_user.updateExtendProperty(handler,function(err,result){
    return callback_(err,result);
  });
};

function checkUser(user,callback_){
  try {
    if (user.password != undefined) {
      check(user.password, __("js.ctr.check.user.password.min")).notEmpty();
      check(user.password, __("js.ctr.check.user.password.max")).notEmpty().len(1,20);
    }

    if (user.userName != undefined) {
      check(user.userName, __("js.ctr.check.user.uid.min")).notEmpty();
      check(user.userName, __("js.ctr.check.user.uid.max")).notEmpty().len(3,30);
      check(user.userName, __("js.ctr.check.user.uid.ismail")).notEmpty().isEmail();
    }

    if (user.first != undefined) {
      check(user.first, __("js.ctr.check.user.name.min")).notEmpty();
      check(user.first, __("js.ctr.check.user.name.max")).notEmpty().len(1,20);
    }

    if (user.extend !=undefined && user.extend.title != undefined) {
      check(user.extend.title, __("js.ctr.check.user.title.max")).len(0,20);
    }

    if (user.extend !=undefined && user.extend.tel != undefined) {
      check(user.extend.tel, __("js.ctr.check.user.telephone.max")).len(0,30);
    }

    if (user.extend !=undefined && user.extend.description != undefined) {
      check(user.extend.description, __("js.ctr.check.user.description.max")).len(0,100);
    }
  } catch (e) {
    return callback_(new error.BadRequest(e.message));
  }
  return callback_();
};
