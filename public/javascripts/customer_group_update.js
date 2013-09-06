$(function () {
  'use strict';

  //取得URL参数
  var groupidArr = window.location.href.split("/")
  var groupid;
   if (groupidArr[groupidArr.length - 1].length > 20) {
     groupid = groupidArr[groupidArr.length - 1];
   }

  // 初始化用户
  var view = smart.view("user").view;
  view.initialize("textBoxMember", "", {search_target: "user"});

  //画面表示
  render(groupid,view);
  //事件追加
  $("#updateGroup").bind("click", function(event){
    //取得组信息
    var group = getGroupData();
    //check组信息
    var checkResult =  checkGroupData (group);
    //更新组信息
    if (checkResult)   {
      if (groupid) {
        //编辑组
        group._id = groupid;
        updateGroup(group)
      } else {
        //添加组
        addGroup(group);
      }
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
    , valid : 1
  };
  return group;
}

//check组信息
function checkGroupData(group) {
  try {
    check(group.name.name_zh, 'グループ名を入力してください。').notEmpty();
    check(group.member, 'メンバを入力してください。').notEmpty();
  } catch (e) {
    Alertify.log.error(e.message);
    return false;
  }
  return true;
}

//添加组
function addGroup(group) {
  smart.dopost("/group/add.json", group, function(err, result) {

    if (err) {
      Alertify.log.error("新規に失敗しました。");
      console.log(err);
    } else {
      window.location = "/customer/group";
    }
  });
}

//更新组
function updateGroup(group) {
  smart.doput("/group/update.json", group, function(err, result){
    if (err) {
      Alertify.log.error("更新に失敗しました。");
      console.log(err);
    } else {
      window.location = "/customer/group";
    }

  });
}