$(function () {
  'use strict';

  //取得用户ID
  var userid =  $('#userId').val();
  //画面表示
  render(userid);
  //事件追加
  $("#updateUser").bind("click", function(event){
    //取得用户信息
    var user = getUserData(userid);

    if (userid && userid.length > 0) {
      //编集用户
      user.uid = userid;    //编集用户ID
      updateUser(user)
    } else {
      //添加用户
      user.extend.type = 0;      //普通用户
      addUser(user);
    }
    return false;
  });
});
//用户类型
var userType = 0;
//画面表示
function render(userid) {
  userType =  $('#userType').val();
  if (userid) {
    smart.doget("/yiuser/findOne.json?uid=" + userid , function(err, result) {
      if (err) {
        smart.error(err,i18n["js.common.search.error"],false);
      } else {
        if (result) {
          if (result.comp) {
            //契约客户时,没有contents权限
            if(result.comp.type !=2) {
              $("#contents").css("display","none");
            }
          }
          if (result.item) {
            $("#inputCompanyCode").val(result.item.companycode);
            $("#inputCompanyCode").attr("disabled","disabled");
            $("#inputUserID").val(result.item.userName);
            $("#inputUserID").attr("disabled","disabled");
            $("#inputPassword").val(result.item.password);
            $("#inputPassword").attr("oldpass",result.item.password);
            $("#inputName").val(result.item.first ? result.item.first:"");
            $("#inputRole").val(result.item.extend.title);
            $("#inputPhone").val(result.item.extend.tel);
            $("#inputComment").val(result.item.extend.description);

            var inputLang = result.item.lang;
            new ButtonGroup("inputLang", inputLang).init();
            var inputTimezone = result.item.timezone;
            new ButtonGroup("inputTimezone", inputTimezone).init();
            var inputContents = result.item.extend.authority && result.item.extend.authority.contents == 1 ? "1" : "0";
            new ButtonGroup("inputContents", inputContents).init();
            var inputNotice = result.item.extend.authority && result.item.extend.authority.notice == 1 ? "1" : "0";
            new ButtonGroup("inputNotice", inputNotice).init();
            var inputApproved = result.item.extend.authority && result.item.extend.authority.approve == 1 ? "1" : "0";
            new ButtonGroup("inputApproved", inputApproved).init();
            var inputActive = result.item.extend.active == 1 ? "1" : "0";
            new ButtonGroup("inputActive", inputActive).init();
          }
        }
      }
    });
  } else {
    smart.doget("/yiuser/findOne.json?uid=" + "" , function(err, result) {
      if (err) {
        smart.error(err,i18n["js.common.search.error"],false);
      } else {
        if (result.comp) {
           //契约客户时,没有contents权限
           if(result.comp.type !=2) {
             $("#contents").css("display","none");
           }
        }
      }
    });
    //初期值:日语,东九区,承认权限,通知权限没有
    new ButtonGroup("inputLang", "ja").init();
    new ButtonGroup("inputTimezone", "GMT+09:00").init();
    new ButtonGroup("inputContents", "0").init();
    new ButtonGroup("inputNotice", "0").init();
    new ButtonGroup("inputApproved", "0").init();
    new ButtonGroup("inputActive", "0").init();
    //会社代码 不显示
    $("#companycode").css("display","none");
  }
}

//取得用户信息
function getUserData(userid) {

//  var user1 = {
//    userName : $("#inputUserID").val()
//    , first: {
//        name_zh:$("#inputName").val()
//    }
//    , title: $("#inputRole").val()
//    , tel: {
//        telephone:$("#inputPhone").val()
//    }
//    , "description": $("#inputComment").val()
//    , "timezone": $("#inputTimezone").attr('value')
//    , "lang": $("#inputLang").attr('value')
//  };

  var user = {
    userName          : $("#inputUserID").val()
    , first           : $("#inputName").val()
    , "timezone"      : $("#inputTimezone").attr('value')
    , "lang"          : $("#inputLang").attr('value')
    , extend: {
        tel           : $("#inputPhone").val()
      , "description" : $("#inputComment").val()
      , title         : $("#inputRole").val()
    }
  };


  //编集时,如果密码没有变更,不提交密码.
  if ($("#inputPassword").val() != $("#inputPassword").attr("oldpass")) {
    user.password = $("#inputPassword").val();
  }
  //承认者,通知者,Contents作成者,有效在画面不表示时,不指定值.
  if ($("#inputContents").size() > 0) {
    var contents = $("#inputContents").attr('value');
    user.extend.authority = user.extend.authority || {};
    user.extend.authority.contents = contents;
  }
  if ($("#inputApproved").size() > 0) {
    var approved = $("#inputApproved").attr('value');
    user.extend.authority = user.extend.authority || {};
    user.extend.authority.approve = approved;
  }
  if ($("#inputNotice").size() > 0) {
    var notice = $("#inputNotice").attr('value');
    user.extend.authority = user.extend.authority || {};
    user.extend.authority.notice = notice;
  }
  if ($("#inputActive").size() > 0) {
    var active = $("#inputActive").attr('value');
    user.extend.active = active;
  }
  return user;
}

//添加用户
function addUser(user) {
  smart.dopost("/user/add.json", user, function(err, result) {
    if (err) {
      smart.error(err,i18n["js.common.add.error"],false);
    } else {
      window.location = "/customer/user";
    }
  });
}

//更新用户
function updateUser(user) {
  smart.doput("/user/update.json", user, function(err, result){
    if (err) {
      smart.error(err,i18n["js.common.update.error"],false);
    } else {
     //管理员时,迁移到用户一览,普通用户,迁移到yukari主页.
     if (userType == 1) {
        window.location = "/customer/user";
      } else {
        window.location ="/yukari";
      }
    }
  });
}
