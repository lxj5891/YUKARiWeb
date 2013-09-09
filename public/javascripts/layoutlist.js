$(function () {
  'use strict';

  // add layout
  $("#addLayout").bind("click", function(event){
    window.location = "/content/layout/add";
  });

  var publishFlag = $("#publishFlag").val();
  var statusFlag  = $("#statusFlag").val();
  // set page title
  setTitle (publishFlag, statusFlag);
  // show layout list
  render(0, 20);
  // get the events for buttons
  events();

  // 初始化承认者
  var view = smart.view("user").view;
  view.initialize("textBoxConfirm", "", {search_target: "user", target_limit: 1, search_auth: "approve"});

  $("#applyButton").bind("click", function(event){

    // 承認者セット
    var confirmby;
    $("#textBoxConfirm li").each(function() {
      if ("user" == $(this).attr("type")) {
        confirmby = $(this).attr("uid");
      }
      //last;
    });
    if (!confirmby) {
      Alertify.log.error("承認者を指定してください。");
    } else {
      var confirmId = $("#confirmId").val();

      smart.dopost("/layout/apply.json", {"id": confirmId, confirmby: confirmby}, function(err, result){
        if (err) {
          var mess = err.message || "申請に失敗しました。";
          Alertify.log.error(mess); console.log(err);
        } else {
          render(0, 20);
          Alertify.log.success("申請しました。");
        }
        $("#applyModal").modal("hide");
      });
    }
  });
});

function setTitle (publishFlag, statusFlag) {
  if (!publishFlag && !statusFlag) {
    return ;
  }

  if (publishFlag == 1) {

    $("#list_title").html("公式中 レイアウト一覧");

  } else if (statusFlag == 21) {

    $("#list_title").html("申請中 レイアウト一覧");
  } else if (statusFlag == 22) {

    $("#list_title").html("承認待ち レイアウト一覧");
  }
}

/**
 * get layout list
 */
function render(start, count) {
    var publish = $("#publishFlag").val();
    var status  = $("#statusFlag").val();

    var jsonUrl = "/layout/list.json?";
    jsonUrl += "start=" + start;
    jsonUrl += "&count=" + count;
    jsonUrl += "&publish=" + publish;
    jsonUrl += "&status=" + status;

  smart.doget(jsonUrl, function(e, result){

    var layoutList = result.items;
    var container = $("#layout_list")
      , index = 1;
    console.log(layoutList);
    container.html("");

    // publish list
    if (publish == 1) {
      $('#layout_header').html("<tr><th>#</th><th>名称</th><th>更新者</th><th>更新日</th><th>操作</th></tr>");

      var tmpl = $('#tmpl_publishlayout_list').html();

      _.each(layoutList, function(row){
        var active = row.active;

        container.append(_.template(tmpl, {
          "id": row._id
          , "layoutId" : row.layoutId
          , "index": index++ + start
          , "name": active.layout.name
          , "editat": smart.date(active.editat)
          , "editby": active.user.name.name_zh
          , "class3": (active&&active.layout&&active.layout.image&& !_.isEmpty(active.layout.image.imageH)) ? "" : "disabled"
          , "preview_image" :(active&&active.layout&&active.layout.image&& active.layout.image.imageH) ? active.layout.image.imageH : null
        }));
      });

    // apply list
    } else if (status == 21) {
      $('#layout_header').html("<tr><th>#</th><th>名称</th><th>承認者</th><th>申請日</th><th>操作</th></tr>");

      var tmpl = $('#tmpl_applylayout_list').html();

      _.each(layoutList, function(row){
        container.append(_.template(tmpl, {
          "id": row._id
          , "index": index++ + start
          , "name": row.layout.name
          , "editat": smart.date(row.editat)
          , "confirmby": row.user.name.name_zh
          , "class3": (row&&row.layout&&row.layout.image&& !_.isEmpty(row.layout.image.imageH)) ? "" : "disabled"
          , "preview_image" : (row&&row.layout&&row.layout.image&& !_.isEmpty(row.layout.image.imageH)) ? row.layout.image.imageH : null
        }));
      });

    //
    } else if (status == 22) {
      $('#layout_header').html("<tr><th>#</th><th>名称</th><th>申請者</th><th>申請日</th><th>操作</th></tr>");

      var tmpl = $('#tmpl_confirmlayout_list').html();

      _.each(layoutList, function(row){
        container.append(_.template(tmpl, {
          "id": row._id
          , "index": index++ + start
          , "name": row.layout.name
          , "editat": smart.date(row.editat)
          , "editby": row.user.name.name_zh
          , "class3": (row&&row.layout&&row.layout.image&& !_.isEmpty(row.layout.image.imageH)) ? "" : "disabled"
          , "preview_image" : (row&&row.layout&&row.layout.image&& !_.isEmpty(row.layout.image.imageH)) ? row.layout.image.imageH : null

        }));
      });

    } else {

      var tmpl = $('#tmpl_layout_list').html();

      _.each(layoutList, function(row){
        container.append(_.template(tmpl, {
          "id": row._id
          , "index": index++ + start
          , "name": row.layout.name
          , "status": get_status(row.status)
          , "publish": get_publish(row.publish)
          , "editat": smart.date(row.editat)
          , "editby": row.user.name.name_zh
          , "class1": (row.status == 2) ? "disabled" : ""
          , "class2": (row.status != 1) ? "disabled" : ""
          , "class4": (row.publish == 1 || row.status == 2) ? "disabled" : ""
          , "class5": (row&&row.layout&&row.layout.image&& !_.isEmpty(row.layout.image.imageH)) ? "" : "disabled"
          , "preview_image" :(row&&row.layout&&row.layout.image&& row.layout.image.imageH) ? row.layout.image.imageH : null
      }));
    });
  }
    // 设定翻页
    smart.pagination($("#pagination_area"), result.totalItems, count, function(active, rowCount){
      render.apply(window, [active, count]);
    });
  });

  function get_status (status_) {
      var status_title;
      switch (status_) {
          case 1:
                status_title = "未申請";
                break;
          case 2:
                status_title = "申請中";
                break;
          case 3:
                status_title = "否認";
                break;
          case 4:
                status_title = "承認済み";
                break;
        }
        return status_title;
  }
  function get_publish (publish_) {
      if (publish_ == 1) {
          return "あり";
      }  else {
          return "なし";
      }
  }
}

function events() {

  // list events
  $("#layout_list").on("click", "a", function(event){
    var target = $(event.target);
    var operation = target.attr("operation")
      , rowid = target.attr("rowid")
      , imageH = target.attr("imageH")
      , layoutId= target.attr("layoutId");  // 公式レイアウトのlayoutId

    if (operation == "edit") {
      if (status == 2) {
        target.addClass("disabled");
      } else {
        window.location = "/content/layout/edit/" + rowid;
      }
    }

    if (operation == "delete") {
        Alertify.dialog.confirm("削除します。よろしいですか？", function () {

            // OK
            smart.dodelete("/layout/remove.json", {"id": rowid, "layoutId": layoutId}, function(err, result){
                if (err) {
                    Alertify.log.error("削除に失敗しました。"); console.log(err);
                } else {
                    render(0, 20);
                    Alertify.log.success("削除しました。");
                }
            });
        }, function () {
            // Cancel
        });
    }

    if (operation == "copy") {
//        smart.dopost("/layout/copy.json", {"id": rowid}, function(err, result){
//            if (err) {
//                Alertify.log.error("コピーに失敗しました。"); console.log(err);
//            } else {
//                render(0, 20);
//                Alertify.log.success("コピーしました。");
//            }
//        });
      window.location = "/content/layout/copy/" + rowid;
    }

    if (operation == "apply") {
       $("#applyModal").modal("show");
       $("#confirmId").val(rowid);
    }
    if (operation == "confirm") {
        smart.dopost("/layout/confirm.json", {"id": rowid, "confirm": 1}, function(err, result){
            if (err) {
                Alertify.log.error("承認に失敗しました。"); console.log(err);
            } else {
                render(0, 20);
                Alertify.log.success("承認しました。");
            }
        });
    }

    if (operation == "deny") {
        smart.dopost("/layout/confirm.json", {"id": rowid, "confirm": 2}, function(err, result){
            if (err) {
                Alertify.log.error("否認に失敗しました。"); console.log(err);
            } else {
                render(0, 20);
                Alertify.log.success("否認しました。");
            }
        });
    }

    if (operation == "preview") {
            var files = [];
            if(imageH){
                files.push(imageH);
                var tmpl = $('#tmpl_slide').html();
                $("#slide").html("");
                $("#slide").append(_.template(tmpl, { files: files , count: files.length}));
                $("#page1").addClass("active");
                $("#slide1").addClass("active");
                $("#syntheticModal").modal("show");
            } else {
                Alertify.dialog.alert("プレビュー画像が生成されません", function () {
                    console.log("プレビュー画像が生成されません");
                });
            }
  }
      return false;
  });

}
