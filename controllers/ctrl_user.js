//var smart     = require("smartcore")
//  , json      = smart.core.json
//  , user      = smart.mod.user
  var util      = smart.framework.util
  , _         = smart.util.underscore
  , async      = smart.util.async
  , response  = smart.framework.response
  , auth      = smart.framework.auth
  , log       = smart.framework.log
  , company   = smart.ctrl.company
  , crl_user  = smart.ctrl.user
  , error     = smart.framework.errors
  , context   = smart.framework.context
  , SmartCtrlGroup = smart.ctrl.group
  , yiutil    = require('../core/utils')
  , SmartModGroup = require('../node_modules/smartcore/lib/models/mod_group.js')
  , SmartModUser = require('../node_modules/smartcore/lib/models/mod_user.js');

var FAKE_PASSWORD = "000000000000000000000";

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

/**
 * 检索用户
 */
exports.searchuser = function(handler,callback_){

  var code = handler.code
    , usercondition = { valid : 1 }
    , auth = handler.params.search_auth
    , keyword = handler.params.keywords
    , target_ = handler.params.search_target
    , scope = handler.params.scope || 1;

// 老smartcore的search里，mod层的判断，拿到现在的ctrl完成
  if (auth == "notice") {
    usercondition.extend.authority.notice = 1;
  } else if (auth == "approve") {
    usercondition.extend.authority.approve = 1;
  }
  if(keyword){
    usercondition.$or = [
      {"name" : new RegExp(keyword.toLowerCase(), "i")}
      ,{"extend.letter_zh" : new RegExp(keyword.toLowerCase(), "i")}
    ]}
  console.log(code);
  async.parallel({
      user: function(callback) {
        if (target_ == "all" || target_ == "user") {
          SmartModUser.getList(code,usercondition,0, Number.MAX_VALUE,{"name" : 'asc'},function(err, users) {
            console.log(users);
            if(scope == 1){
              if (err) {
                return callback(new errors.InternalServer(err));
              }
              callback(err,users);
            }else{
              var guighandler = new context().create(handler.uid ,handler.code,"ja");
              guighandler.addParams("gid",handler.params.scope);
              SmartCtrlGroup.getUsersInGroup(guighandler,function(err,uids){
                var result = [];
                _.each(users,function(u){
                  if(_.contains(uids, u._id.toString())){
                    result.push(u);
                  }
                });
                console.log(result);
                callback(err,result);
              })
            }
          });
        } else {
          callback();
        }
      }
      , group: function(callback) {
        var grouphandler = new context().create(handler.uid ,handler.code,"ja");
        SmartCtrlGroup.getList(grouphandler,function(err,groups){
          if(target_ == "all" || target_ == "group"){
            //old YUKari ctrl_search 暂时的方法不涉及到这个部分
            /*group.getAllGroupByUid(dbName,login_, function(err,viewable){
             var gids = [];
             var groupViewable = [];
             _.each(viewable, function(g){gids.push(g._id.toString());});
             _.each(groups, function(g){
             //if(_.contains(gids,g._id.toString())){
             groupViewable.push(g);
             //}
             });

             if(scope_ == "1"){
             callback(err, groupViewable);
             }else{
             group.childDepartments(dbName,[scope_], function(err, children){
             var gids = [scope_];
             _.each(children, function(g){gids.push(g._id.toString());});
             //console.log(gids);
             var result = [];
             _.each(groupViewable, function(g){
             if(_.contains(gids, g._id.toString())){
             result.push(g);
             }
             });
             callback(err, result);
             });
             }
             });*/
          } else{
            callback();
          }
        });
      }
    }
    , function(err, results){
      callback_(err, { items:results });
    });
}

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


exports.add = function(handler,callback){
  var user = handler.params;
  yiutil.checkUser(user,function(checkErr){
    if(checkErr){
      callback(checkErr);
    }else{
      handler.params.password = auth.sha256(user.password );
      crl_user.add(handler,function(err,result){
        return callback(err, result);
      });
    }
  });
};


exports.update = function(handler,callback_) {

  var user = handler.params;
  yiutil.checkUser(user,function(checkErr){
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
  handler.params.extendValue = parseInt(handler.params.extendValue);
  crl_user.updateExtendProperty(handler,function(err,result){
    return callback_(err,result);
  });
};

exports.searchOne = function(handler, callback_) {
  handler.addParams("code",handler.code);
  company.getByCode(handler,function(err,comp){
    if(err){
      callback_(err);
    }else{
      if (handler.params.uid != ""){
        crl_user.get(handler,function(err_,user){
          if(err_){
            callback_(err_);
          }else{
            user._doc.companycode = handler.req.session.code;
            user.password = FAKE_PASSWORD;
            callback_(err_,{comp:comp,item:user});
          }
        });
      }else{
        callback_(err,{comp:comp,item:null});
      }
    }
  });
};
exports.getList = function(handler, callback_) {
  var condition = {
    valid: 1
  }
  var keyword_ = handler.params.keyword;
  if (keyword_) {
    keyword_ = util.quoteRegExp(keyword_);
    condition.$or = [

      {"first": new RegExp(keyword_.toLowerCase(), "i")}
      ,

      {"first": new RegExp(keyword_.toLowerCase(), "i")}
    ]
  }

  handler.addParams("condition",condition);

  crl_user.getList(handler,function(err,result){
    if(result){
      _.each(result.items,function(user){
        user._doc.companycode = handler.req.session.code;
        if(user.createBy == handler.req.session.user._id){
          user._doc.canbeedit = "1";
        }
      });
    }
    callback_(err,result);
  });
};