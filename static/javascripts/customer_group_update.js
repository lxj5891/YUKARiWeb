$(function () {
  'use strict';

  //取得URL参数
  var groupid = $('#groupId').val();
  // 初始化用户
  var view = new userbox(smart.view("user")).view;
  view.initialize("textBoxMember", "", {search_target: "user"});
  //画面表示
  render(groupid,view);
  //事件追加
  $("#updateGroup").bind("click", function(event){
    //取得组信息
    var group = getGroupData();
    //更新组信息
    if (groupid) {
      //编辑组
      group._id = groupid;
      updateGroup(group)
    } else {
      //添加组
      addGroup(group);
    }
    return false;
  });
});


//画面表示
function render(groupid,view) {
  if (groupid) {
    smart.doget("/group/groupWithMember.json?gid=" + groupid , function(err, result) {
      if (err) {
        smart.error(err,i18n["js.common.search.error"],false);
      } else {
        console.log("-----------------------");
        console.log(result);
        console.log("-----------------------");
        $("#inputName").val(result.name ?result.name: "");
        $("#inputComment").val(result.description);
        var userNameList = [];
        _.each(result.users, function(row){
          if (row.valid == 1) {
            var displayData = {
              uid : row._id,
              uname: row.userName ? row.userName : "",
              type : "user"
            };
            userNameList.push(displayData) ;
          }
        });
        view.setDefaults(userNameList);
      }
    });
  }
}

//取得组信息
function getGroupData() {
  var uids = [];

  $("#textBoxMember ol li").each(function() {
    if ("user" == $(this).attr("type")) {
      uids.push($(this).attr("uid"));
    }
  });
  var group = {
    name: $("#inputName").val()
    ,extend : { member : uids }
    , description : $("#inputComment").val()
  };
  return group;
}

//添加组
function addGroup(group) {
  smart.dopost("/group/add.json", group, function(err, result) {
    if (err) {
      smart.error(err,i18n["js.common.add.error"],false);
    } else {
      window.location = "/customer/group";
    }
  });
}

//更新组
function updateGroup(group) {
  smart.doput("/group/update.json", group, function(err, result){
    if (err) {
      smart.error(err,i18n["js.common.update.error"],false);
    } else {
      window.location = "/customer/group";
    }
  });
}