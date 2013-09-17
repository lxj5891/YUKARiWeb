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

  // 初始化承认者，公开对象
  new userbox(smart.view("user1")).view.initialize(
    "textBoxConfirm", "", {search_target: "user", target_limit: 1, search_auth: "approve"}
  );
  new userbox(smart.view("user2")).view.initialize(
    "textBoxViewer", "", {search_target: "all", target_limit: 20}
  );

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
      Alertify.log.error(i18n["js.public.check.layoutlist.apply"]);
    } else {
      var confirmId = $("#confirmId").val();

      smart.dopost("/layout/apply.json", {"id": confirmId, confirmby: confirmby}, function(err, result){
        if (smart.error(err, i18n["js.public.error.layoutlist.apply"], false)) {
          return;
        } else {
          render(0, 20);
          Alertify.log.success(i18n["js.public.success.layoutlist.apply"]);
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

    $("#list_title").html(i18n["js.public.info.layoutlist.title.publish"]);

  } else if (statusFlag == 21) {

    $("#list_title").html(i18n["js.public.info.layoutlist.title.apply"]);
  } else if (statusFlag == 22) {

    $("#list_title").html(i18n["js.public.info.layoutlist.title.approve"]);
  }
}

/**
 * get layout list
 */
function render(start, count,keyword) {
    var publish = $("#publishFlag").val();
    var status  = $("#statusFlag").val();

    var jsonUrl = "/layout/list.json?";
    jsonUrl += "start=" + start;
    jsonUrl += "&count=" + count;
    jsonUrl += "&publish=" + publish;
    jsonUrl += "&status=" + status;
  if(keyword){
    keyword = keyword ? encodeURIComponent(keyword) : "";
    jsonUrl += "&keyword=" + keyword;
  }
  smart.doget(jsonUrl, function(e, result){

    var layoutList = result.items;
    var container = $("#layout_list")
      , index = 1;
    console.log(layoutList);
    container.html("");

    // publish list
    if (publish == 1) {
      var headerHtml = "<tr><th>#</th><th>" + i18n["js.public.info.layoutlist.tableheader.name"] + "</th><th>" + i18n["html.label.common.updateby"] + "</th><th>" + i18n["html.label.common.updateat"] + "</th><th>" + i18n["html.label.common.operation"] + "</th></tr>";
      $('#layout_header').html(headerHtml);

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
      var headerHtml = "<tr><th>#</th><th>" + i18n["js.public.info.layoutlist.tableheader.name"] + "</th><th>" + i18n["js.public.info.layoutlist.tableheader.approveby"] + "</th><th>" + i18n["js.public.info.layoutlist.tableheader.applyat"] + "</th><th>" + i18n["html.label.common.operation"] + "</th></tr>";
      $('#layout_header').html(headerHtml);

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
      var headerHtml = "<tr><th>#</th><th>" + i18n["js.public.info.layoutlist.tableheader.name"] + "</th><th>" + i18n["js.public.info.layoutlist.tableheader.applyby"] + "</th><th>" + i18n["js.public.info.layoutlist.tableheader.applyat"] + "</th><th>" + i18n["html.label.common.operation"] + "</th></tr>";
      $('#layout_header').html(headerHtml);

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
    if(layoutList.length == 0 ){
      container.html(i18n["js.common.list.empty"]);
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
                status_title = i18n["js.public.info.layoutlist.status.01"];//"未申請"
                break;
          case 2:
                status_title = i18n["js.public.info.layoutlist.status.02"];//"申請中"
                break;
          case 3:
                status_title = i18n["js.public.info.layoutlist.status.03"];//"否認"
                break;
          case 4:
                status_title = i18n["js.public.info.layoutlist.status.04"];//"承認済み"
                break;
        }
        return status_title;
  }
  function get_publish (publish_) {
      if (publish_ == 1) {
          return i18n["js.public.info.layoutlist.publish.status.01"];//"あり"
      }  else {
          return i18n["js.public.info.layoutlist.publish.status.02"];//"なし"
      }
  }
}

function events() {

  $("#txt_search").bind("change",function(){
      var _keyword = '';
      _keyword =  $("#txt_search").val();
      smart.paginationInitalized = false;
      render(0, 20,_keyword);
  });

  $("#doSearch").bind("click",function(){
      var _keyword = '';
      _keyword =  $("#txt_search").val();
      smart.paginationInitalized = false;
      render(0, 20,_keyword);
  });


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
        Alertify.dialog.labels.ok = i18n["js.common.dialog.ok"];
        Alertify.dialog.labels.cancel = i18n["js.common.dialog.cancel"];
        Alertify.dialog.confirm(i18n["js.common.delete.confirm"], function () {

            // OK
            smart.dodelete("/layout/remove.json", {"id": rowid, "layoutId": layoutId}, function(err, result){
                if (smart.error(err,i18n["js.common.delete.error"], false)) {

                } else {
                    render(0, 20);
                    Alertify.log.success(i18n["js.common.delete.success"]);
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
            if (smart.error(err,i18n["js.public.error.layoutlist.confirm"],false)) {

            } else {
                render(0, 20);
                Alertify.log.success(i18n["js.public.success.layoutlist.confirm"]);
            }
        });
    }

    if (operation == "deny") {
        smart.dopost("/layout/confirm.json", {"id": rowid, "confirm": 2}, function(err, result){
            if (smart.error(err,i18n["js.public.error.layoutlist.deny"],false)) {

            } else {
                render(0, 20);
                Alertify.log.success(i18n["js.public.success.layoutlist.deny"]);
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
                Alertify.dialog.alert(i18n["js.public.error.layoutlist.preview"], function () {
                    console.log("プレビュー画像が生成されません");
                });
            }
  }
      return false;
  });

}
