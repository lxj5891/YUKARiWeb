$(function () {
  'use strict';
  //取得URL参数
  //TODO 暂定取法
  var userid = window.location.href.split("/")[6];
  //画面表示
  render(userid);
  //事件追加
  $("#updateUser").bind("click", function(event){
    //取得用户信息
    var user = getUserData();
    //check用户信息
    var checkResult =  checkUserData (user);
    //更新用户信息
    if (checkResult)   {
      if (userid) {
        //编辑用户
        user.id = userid;
        updateUser(user)
      } else {
        //添加用户
        addUser(user);
      }
    }
    return false;
  });
});
var userType = 0;
//画面表示
function render(userid) {
  if (userid) {
    smart.doget("/user/findOne.json?userid=" + userid , function(e, result) {
      if (result) {
        $("#inputUserID").val(result.uid);
        $("#inputUserID").attr("disabled","disabled");
        $("#inputPassword").val(result.password);
        $("#inputName").val(result.name ? result.name.name_zh:"");
        $("#inputRole").val(result.title);
        $("#inputPhone").val(result.tel ? result.tel.telephone:"");
        $("#inputComment").val(result.description);
        if (result.authority && result.authority.notice == 1) {
          $("#inputNotice").attr("checked",true);
        } else {
          $("#inputNotice").attr("checked",false);
        }
        if (result.authority && result.authority.approve == 1) {
          $("#inputApproved").attr("checked",true);
        } else {
          $("#inputApproved").attr("checked",false);
        }
        if (result.active == 1) {
          $("#inputActive").attr("checked",true);
        } else {
          $("#inputActive").attr("checked",false);
        }
        userType = result.type;
      }
      console.log(e);
    });
  }
}

//取得用户信息
function getUserData() {

  var notice = $("#inputNotice").prop('checked') ? 1:0;
  var approved =$("#inputApproved").prop('checked') ? 1:0;
  var active =$("#inputActive").prop('checked') ? 1:0;

  var user = {
     userid : $("#inputUserID").val()
    , password: $("#inputPassword").val()
    , name: {
        name_zh:$("#inputName").val()
    }
    , title: $("#inputRole").val()
    , tel: {
        telephone:$("#inputPhone").val()
    }
    , description: $("#inputComment").val()
    , timezone :"GMT+08:00" //TODO 暂定
  };
  //自己编辑自己信息时,承认者,通知者,有效 不能指定.
  if ($("#inputNotice").size() > 0 && $("#inputApproved").size() > 0) {
    user.authority = {
        notice : notice
      , approve : approved
    };
  }
  if ($("#inputActive").size() > 0) {
    user.active = active;
  }
  return user;
}

//check用户信息
function checkUserData(user) {
  try {
    check(user.userid, 'ユーザIDを入力してください。').notEmpty().isEmail();
    check(user.password, 'パスワードを入力してください。').notEmpty();
    check(user.name.name_zh, 'ユーザ名を入力してください。').notEmpty();
  } catch (e) {
    Alertify.log.error(e.message);
    return false;
  }
  return true;
}

//添加用户
function addUser(user) {
  user.type = 0;
  smart.dopost("/user/add.json", user, function(err, result) {

    if (err) {
      if (result.responseJSON.error.code) {
        Alertify.log.error(result.responseJSON.error.message);
      } else {
        Alertify.log.error("新規に失敗しました。");
        console.log(err);
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
      Alertify.log.error("更新に失敗しました。");
      console.log(err);
    } else {
     if (userType == 1) {
        window.location = "/customer/user";
      } else {
        window.location ="/yukari";
      }
    }
  });
}
