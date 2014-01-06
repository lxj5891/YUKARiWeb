//var smart     = require("smartcore")
//  , json      = smart.core.json
//  , user      = smart.mod.user
var util      = smart.framework.util
  ,fs         =smart.lang.fs
  ,csv        =smart.util.csv
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
            if(scope == 1){
              if (err) {
                return callback(new errors.InternalServer(err));
              }

              callback(err,users);
            }else{
              //暂时看来应该是进不来的,scope总是等于1
              var guighandler = new context().create(handler.uid ,handler.code,"ja");
                guighandler.addParams("gid",handler.params.scope);
                SmartCtrlGroup.getUsersInGroup(guighandler,function(err,uids){
                  var result = [];
                  _.each(users,function(u){
                    if(_.contains(uids, u._id.toString())){
                      result.push(u);
                    }
                  });
                  callback(err,result);
              })
            }
          });
        } else {
          callback();
        }
      }
      , group: function(callback) {
        if(target_ == "all" || target_ == "group"){
          if(scope == "1"){
            var grouphandler = new context().create(handler.uid ,handler.code,"");
            grouphandler.code = handler.code;
            grouphandler.addParams("condition",{"extend.member":handler.uid});
            SmartCtrlGroup.getList(grouphandler,function(err,groups){
              if(err){
                return callback(new errors.InternalServer(err));
              }else{

                callback(err,groups.items);
              }
            });
          }else{
//scope != 1，时，暂时还不知道什么情况会出现，具体出现时候再处理此种情况
//            group.childDepartments(dbName,[scope_], function(err, children){
//              var gids = [scope_];
//              _.each(children, function(g){gids.push(g._id.toString());});
//              //console.log(gids);
//              var result = [];
//              _.each(groupViewable, function(g){
//                if(_.contains(gids, g._id.toString())){
//                  result.push(g);
//                }
//              });
//              callback(err, result);
//            });callback();
          }
        }else{
        callback();
        }
      }
    }
    , function(err, results){
      console.log(results);
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

// 下载模板
exports.downloadTemp = function(req_, res_) {
  getTemplate(function(err, data){
    res_.set('Content-Type', 'text/csv');
    res_.attachment("user_template.csv");
    csv().from.array(data).to.stream(res_, {rowDelimiter: '\r\n'});
  })
};


//下载csv模板
getTemplate = function(callback){
  var data = [
    [ // titles
      "UID（*）", "パスワード（デフォルトはUIDのアドレスの先頭）", "名前",  "職位", "電話番号", "コメント", "言語", "タイムゾーン"
    ]
    ,[ // line1
      'temp@gmail.com', '', 'temp','課長','0411-12345678', '', 'zh','GMT+08:00'
    ]
  ];
  callback(null, data);

};

// CSV导入用户
exports.import = function(handler,callback){
//exports.import = function(req_, res_){
  var req_=handler.req
     ,res_=handler.res;
  console.log("11111111111111"+req_);
  console.log("11111111111111"+res_);
  if(!req_.files.csvfile || !req_.files.csvfile.path) {
    response.send(res_, "",{ code: 400, message: __("user.error.CantFindImportFile")});
    return;
  }

  // 先读文件的目的是为了预处理回车换行符，当前csv模块处理有问题。
  fs.readFile(req_.files.csvfile.path, 'utf-8', function(err, data) {
    if (err) {
      response.send(res_,"",{ code: 400, message: __("user.error.CantFindImportFile")});
      return;
    }

    // 统一换行符，解决这个csv模块的回车换行的bug
    data = data.replace(/\r\n/g, '\n');
    data = data.replace(/\r/g, '\n');

    var records = [];
    var error_import;
    csv()
      .from.string(data)
      .on('record', function(row,index){
        if(index > 0) { // 跳过Head
          records.push(row);
        }
        return row;
      })
      .on('end', function(count){
        if(error_import) {
          error_import.message =  (index + 1) + __("user.csv.rownum") + error_import.message;
          response.send(res_,"", { code: 200, message: error_import.message});
        } else {
          if(records.length == 0) {
            response.send(res_,err,{ message: __("user.error.ThereIsNoImportDataPleaseSpecifyTheData") });
            return;
          }


            var importRow =function(row_,sub_callback){

              console.log('#'+index+' '+JSON.stringify(row_));

              csvImportRow(handler, row_, function(err, result){
                if(err) {
                  console.log(err)
                  sub_callback(err);
                  //error_import = err;
                }else{
                  sub_callback(err,result);
                }
              })

            }

            async.eachSeries(records,importRow,function(err){
              callback(err);

            });




        }

      })
      .on('error', function(error){
        var error_message = __("user.csv.canNotToParseTheCSVFile");
        error_import = {
          code: 200
          ,message: error_message
        };
        console.log(error_message + '\n' + error.message);
      });
      return callback(err,data);
  });

};



csvImportRow = function(handler, row, callback) {
  var exe_user=handler.req.session.user;
  var code = handler.code;
  var now = new Date();
  var u = {
    type:   0      // 用户类型， 默认0.   0: 普通用户, 1: 系统管理员
    ,active: 1
    ,companyid : exe_user.companyid           ////////////我们得通过调用方法取id////////
    ,companycode: code
    ,valid : 1
  };
  if(row[0]) { u.uid                                              = row[0]; }
  if(row[1]) { u.password                                         = auth.sha256(row[1]); }
  if(row[2]) { u.name = u.name || {}; u.name.name_zh              = row[2]; }
  if(row[3]) { u.title                                            = row[3]; }
  if(row[4]) { u.tel = u.tel || {}; u.tel.telephone               = row[4]; }
  if(row[5]) { u.description                                      = row[5]; }
  if(row[6]) { u.lang                                             = row[6]; }
  if(row[7]) { u.timezone                                         = row[7]; }

  u = util.checkObject(u);

  // Check uid
  if(!u.uid) {
    callback(new error.BadRequest("UIDを指定してください。"));
    return;
  }else if(u.uid == "admin") {
    callback(new error.BadRequest("UIDに管理者を指定できません。"));
    return;
  }

  // Check password
  if(!u.password) {// 如果没输入用默认的uid做密码，如果是邮件取"@"前做密码
    /^(.*)@.*$/.test(u.uid);
    if(!RegExp.$1) {
      callback(new error.BadRequest("パスワードを指定してください。"));
      return;
    }
    u.password = auth.sha256(RegExp.$1);
  }
//
//  // Check email
//  if(u.email) {
//    if(u.email.email1 && !util.isEmail(u.email.email1)) {
//      callback(new Error("メールアドレスが正しくありません。"));
//      return;
//    }
//    if(u.email.email2 && !util.isEmail(u.email.email2)) {
//      callback(new Error("メールアドレスが正しくありません。"));
//      return;
//    }
//  }
  // Check name
  if(!u.name) {
    return callback(new error.BadRequest("名前を指定してください。"));
  }
//    if(u.tel.mobile && !util.isTel(u.tel.mobile)) {
//      callback(new Error("携帯番号が正しくありません。"));
//      return;
//    }
//  }
  // Check tel
  if(u.tel) {
    if(u.tel.telephone && !util.isTel(u.tel.telephone)) {
      callback(new error.BadRequest("電話番号が正しくありません。"));
      return;
    }
//    if(u.tel.mobile && !util.isTel(u.tel.mobile)) {
//      callback(new Error("携帯番号が正しくありません。"));
//      return;
//    }
  }

  // Check language
  if(u.lang){
    if(u.lang != "zh" && u.lang != "en" && u.lang != "ja") {
      callback(new error.BadRequest('入力言語が正しくありません。”zh”、”en”、”ja”の何れを指定してください。'));
      return;
    }
  }else {
    u.lang = "zh"; // default language
  }

  // Check timezone
  if(u.timezone) {
    if(u.timezone != "GMT+08:00" && u.timezone != "GMT+09:00" && u.timezone != "GMT-05:00") {
      callback(new error.BadRequest('タイムゾーンが正しくありません。”GMT+08:00”、”GMT+09:00”、 ”GMT-05:00”の何れを指定してください。'));
      return;
    }
  } else {
    u.timezone = "GMT+08:00"; // default timezone
  }
//
//  if(u.custom) {
//    // Check url
//    if(u.custom.url && !util.isUrl(u.custom.url)) {
//      callback(new Error('ホームページが正しくありません。'));
//      return;
//    }
//  }
  exports.findByDBName(code, {"uid": u.uid}, function(err, result){
    if(result && result.length > 0){               // Update user
      u.editby = exe_user._id;
      u.editat = now;

      exports.updateByDBName(code, result[0]._id, u, function(err, result) {
        //console.log('Update User.');
        callback(err, result);
      });
    } else {                                        // Create user
      u.createby = exe_user._id;
      u.createat = now;
      u.editby = exe_user._id;
      u.editat = now;

      exports.createByDBName(code, u, function(err, result) {
        //console.log('Create User.');
        callback(err, result);
      });
    }
  });
}
