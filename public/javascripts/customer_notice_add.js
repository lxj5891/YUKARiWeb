
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

    if (!check_notice(notice)) {

      smart.dopost("/notice/add.json", notice, function(err, result) {
        if (err) {
          smart.error(err,i18n["js.common.add.error"],false);
        } else {
          window.location = "/customer/notice";
        }
      });

    }
  });

  // 初始化承认者
  var view = smart.view("user").view;
  //view.initialize("textBoxNotice");
  view.initialize("textBoxNotice", "", {search_target: "all"});
});

function check_notice (notice_) {
  var flag = 0;
  if (notice_.title == "") {
    Alertify.log.error(i18n["js.public.check.notice.title"]);
    flag = 1;
  }
  if (notice_.user == "" && notice_.group == "") {
    Alertify.log.error(i18n["js.public.check.notice.user"]);
    flag = 1;
  }
  if (notice_.notice == "") {
    Alertify.log.error(i18n["js.public.check.notice.message"]);
    flag = 1;
  }

  return flag;
}
