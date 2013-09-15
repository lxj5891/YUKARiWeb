$(function () {
  'use strict';

  //取得URL参数
  var groupid = $('#groupId').val();;
  // 初始化用户
  var view = smart.view("user").view;
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
    smart.doget("/group/groupWithMember.json?gid=" + groupid , function(e, result) {
      console.log(result);
      $("#inputName").val(result.name ?result.name.name_zh: "");
      $("#inputComment").val(result.description);
      var userNameList = [];
        _.each(result.users, function(row){
             if (row.valid == 1) {
               var displayData = {
                   uid : row._id,
                   uname: row.name ? row.name.name_zh : "",
                   type : "user"
               };
               userNameList.push(displayData) ;
             }
        });
      view.setDefaults(userNameList);
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
    name: {
      name_zh:$("#inputName").val()
    }
    , member : uids
    , description : $("#inputComment").val()
  };
  return group;
}

//添加组
function addGroup(group) {
  smart.dopost("/group/add.json", group, function(err, result) {
    if (err) {
      if (result.code) {
        Alertify.log.error(result.message);
      } else {
        Alertify.log.error(i18n["js.common.add.error"]);
      }
    } else {
      window.location = "/customer/group";
    }
  });
}

//更新组
function updateGroup(group) {
  smart.doput("/group/update.json", group, function(err, result){
    if (err) {
      if (err.responseJSON.error.code) {
        Alertify.log.error(err.responseJSON.error.message);
      } else {
        Alertify.log.error(i18n["js.common.update.error"]);
      }
    } else {
      window.location = "/customer/group";
    }
  });
}