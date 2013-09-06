
$(function () {
  'use strict';

  // 发送消息
  $("#addNotice").bind("click", function(event){

    var uids = [], gids = [];
    $("#textBoxNotice li").each(function() {
      if ("user" == $(this).attr("type")) {
        uids.push($(this).attr("uid"));
      }
      if ("group" == $(this).attr("type")) {
        gids.push($(this).attr("uid"));
      }
    });

    var notice = {
        title: $("#title").val()
      , notice: $("#notice").val()
      , user: uids.join(",")
      , group: gids.join(",")
    };

    smart.dopost("/notice/add.json", notice, function(e, result) {
      window.location = "/customer/notice";
    });
  });

  // 初始化承认者
  var view = smart.view("user").view;
  //view.initialize("textBoxNotice");
  view.initialize("textBoxNotice", "", {search_target: "all"});
});
