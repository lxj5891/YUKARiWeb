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
      user.id = userid;    //编集用户ID
      updateUser(user)
    } else {
      //添加用户
      user.type = 0;      //普通用户
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
    smart.doget("/user/findOne.json?userid=" + userid , function(e, result) {
      if (result) {
        $("#inputUserID").val(result.uid);
        $("#inputUserID").attr("disabled","disabled");
        $("#inputPassword").val(result.password);
        $("#inputPassword").attr("oldpass",result.password);
        $("#inputName").val(result.name ? result.name.name_zh:"");
        $("#inputRole").val(result.title);
        $("#inputPhone").val(result.tel ? result.tel.telephone:"");
        $("#inputComment").val(result.description);

        var inputLang = result.lang;
        new ButtonGroup("inputLang", inputLang).init();
        var inputTimezone = result.timezone;
        new ButtonGroup("inputTimezone", inputTimezone).init();
        var inputContents = result.authority && result.authority.contents == 1 ? "1" : "0";
        new ButtonGroup("inputContents", inputContents).init();
        var inputNotice = result.authority && result.authority.notice == 1 ? "1" : "0";
        new ButtonGroup("inputNotice", inputNotice).init();
        var inputApproved = result.authority && result.authority.approve == 1 ? "1" : "0";
        new ButtonGroup("inputApproved", inputApproved).init();
        var inputActive = result.active == 1 ? "1" : "0";
        new ButtonGroup("inputActive", inputActive).init();
      }
    });
  } else {
    //初期值:日语,东九区,承认权限,通知权限没有
    new ButtonGroup("inputLang", "ja").init();
    new ButtonGroup("inputTimezone", "GMT+09:00").init();
    new ButtonGroup("inputContents", "0").init();
    new ButtonGroup("inputNotice", "0").init();
    new ButtonGroup("inputApproved", "0").init();
    new ButtonGroup("inputActive", "0").init();
  }
}

//取得用户信息
function getUserData(userid) {

  var user = {
     userid : $("#inputUserID").val()
    , name: {
        name_zh:$("#inputName").val()
    }
    , title: $("#inputRole").val()
    , tel: {
        telephone:$("#inputPhone").val()
    }
    , "description": $("#inputComment").val()
    , "timezone": $("#inputTimezone").attr('value')
    , "lang": $("#inputLang").attr('value')
  };

  //编集时,如果密码没有变更,不提交密码.
  if ($("#inputPassword").val() != $("#inputPassword").attr("oldpass")) {
    user.password = $("#inputPassword").val();
  }
  //自己编辑自己信息时,承认者,通知者,Contents作成者,有效 不能指定.
  if ($("#inputNotice").size() > 0 && $("#inputApproved").size() > 0 && $("#inputContents").size() > 0) {
    var notice =  $("#inputNotice").attr('value');
    var approved = $("#inputApproved").attr('value');
    var contents =  $("#inputContents").attr('value');
    user.authority = {
        notice : notice
      , approve : approved
      , contents: contents
    };
  }
  if ($("#inputActive").size() > 0) {
    var active = $("#inputActive").attr('value');
    user.active = active;
  }
  return user;
}

//添加用户
function addUser(user) {
  smart.dopost("/user/add.json", user, function(err, result) {
    if (err) {
      if (result.responseJSON.error.code) {
        Alertify.log.error(result.responseJSON.error.message);
      } else {
        Alertify.log.error(i18n["js.common.add.error"]);
      }
    } else {
      window.location = "/customer/user";
    }
  });
}

//更新用户
function updateUser(user) {
  smart.doput("/user/update.json", user, function(err, result){
    if (err) {
      if (err.responseJSON.error.code) {
        Alertify.log.error(err.responseJSON.error.message);
      } else {
        Alertify.log.error(i18n["js.common.update.error"]);
      }
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
