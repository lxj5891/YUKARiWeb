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
  new userbox(smart.view("user1")).view.initialize(
    "textBoxConfirm", "", {search_target: "user", target_limit: 1, search_auth: "approve"}
  );
  // 初始化公開先
  new userbox(smart.view("user2")).view.initialize(
    "textBoxViewer", "", {search_target: "all", target_limit: 20}
  );

  moment.lang('ja');
  $("#datepicker").daterangepicker({
    format: "YYYY/MM/DD HH:mm",
    // showDropdowns: true,
    // timePicker: true,
    timePicker12Hour: false
    
  }, function(start, end) {
    $('#openStart').val(start.toJSON());
    $('#openEnd').val(end.toJSON());
  });

  $("#applyButton").bind("click", function(event){

    // 承認者セット
    var confirmby;
    $("#textBoxConfirm li").each(function() {
      if ("user" == $(this).attr("type")) {
        confirmby = $(this).attr("uid");
      }
      //last;
    });

    // 公開先セット
    var viewerUsers = [];
    var viewerGroups = [];
    $("#textBoxViewer li").each(function() {
      if ("user" == $(this).attr("type")) {
        viewerUsers.push($(this).attr("uid"));
      } else if ("group" == $(this).attr("type")) {
        viewerGroups.push($(this).attr("uid"));
      }
    });

    var openStart;
    var openEnd;
    var isSetRange = $('#inputOpenRange').attr('value')=='1'
    if(isSetRange){ // 期间指定
      openStart = $('#openStart').val();
      openEnd = $('#openEnd').val();
    } else {
    }


    if (!confirmby) {
      Alertify.log.error(i18n["js.public.check.layoutlist.apply"]);
    // } else if(viewerUsers.length <= 0 && viewerGroups <= 0) {
    //   Alertify.log.error(i18n["js.public.check.layoutlist.apply.viewer"]);
    } else if(isSetRange && (_.isEmpty(openStart)||_.isEmpty(openEnd))){
      Alertify.log.error(i18n["js.public.check.layoutlist.apply.openrange"]);
    } else {
      var confirmId = $("#confirmId").val();
      var params = {
        "id": confirmId
        , confirmby: confirmby
        , viewerUsers: viewerUsers
        , viewerGroups: viewerGroups
        , openStart: openStart
        , openEnd: openEnd
      };

      smart.dopost("/layout/apply.json", params, function(err, result){
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

    if (smart.error(e, i18n["js.common.search.error"], false)) {
      return;
    }

    var layoutList = result.items;
    var container = $("#layout_list")
      , index = 1;
    //console.log(layoutList);
    container.html("");

    // publish list
    if (publish == 1) {
      var headerHtml = "<tr><th>#</th><th>" + i18n["js.public.info.layoutlist.tableheader.name"]
        + "</th><th>" + i18n["html.label.layout.viewer"]
        + "</th><th>" + i18n["html.label.layout.range"]
        + "</th><th>" + i18n["html.label.common.updateby"]
        + "</th><th>" + i18n["html.label.common.updateat"]
        + "</th><th>" + i18n["html.label.common.operation"] + "</th></tr>";
      $('#layout_header').html(headerHtml);

      var tmpl = $('#tmpl_publishlayout_list').html()
        , canrepeal
        , canMakeContents = parseInt($("#authorityContents").val());

        if (!canMakeContents) {
            canrepeal = "hidden";
        }

      _.each(layoutList, function(row){
        var active = row.active;
        var range = "";
        var tmpSyn = null;
        for(var i = 0 ; ((active&&active.layout&&active.layout.page)&&(i < active.layout.page.length)); i++)
        {
            if(active.layout.page[i].type == '2'&&active.layout.page[i].tile[0]){
                tmpSyn = active.layout.page[i].tile[0].syntheticId;
            }
        }

        if(active.openEnd){
          range = smart.date(active.openStart) + ' - ' + smart.date(active.openEnd);
        } else {
          range = i18n["html.label.layout.range.forever"];
        }

        container.append(_.template(tmpl, {
          "id": row._id
          , "layoutId" : row.layoutId
          , "index": index++ + start
          , "name": active.layout.name
          , "editat": smart.date(active.editat)
          , "editby": active.user.name.name_zh
          , "viewer": get_viewerHtml(row)
          , "range": range
          , "class3": (active&&active.layout&&active.layout.image&&( !_.isEmpty(active.layout.image.imageH)|| !_.isEmpty(active.layout.image.imageV))) ? "" : "hidden"
          , "class6": canrepeal
          , "preview_image_H" :(active&&active.layout&&active.layout.image&& active.layout.image.imageH) ? active.layout.image.imageH : ""
          , "preview_image_V" :(active&&active.layout&&active.layout.image&& active.layout.image.imageV) ? active.layout.image.imageV : ""
          , "tmpSyn"  : tmpSyn
        }));
      });


    // apply list
    } else if (status == 21) {
      var headerHtml = "<tr><th>#</th><th>" + i18n["js.public.info.layoutlist.tableheader.name"]
        + "</th><th>" + i18n["js.public.info.layoutlist.tableheader.approveby"]
        + "</th><th>" + i18n["html.label.layout.viewer"]
        + "</th><th>" + i18n["html.label.layout.range"]
        + "</th><th>" + i18n["js.public.info.layoutlist.tableheader.applyat"]
        + "</th><th>" + i18n["html.label.common.operation"] + "</th></tr>";
      $('#layout_header').html(headerHtml);

      var tmpl = $('#tmpl_applylayout_list').html();

      _.each(layoutList, function(row){
        var tmpSyn = null;
        for(var i = 0 ; ((row&&row.layout&&row.layout.page)&&(i < row.layout.page.length)); i++)
        {
            if(row.layout.page[i].type == '2'&&row.layout.page[i].tile[0]){
                tmpSyn = row.layout.page[i].tile[0].syntheticId;
            }
        }

        var range = "";
        if(row.openEnd){
          range = smart.date(row.openStart) + ' - ' + smart.date(row.openEnd);
        } else {
          range = i18n["html.label.layout.range.forever"];
        }
        container.append(_.template(tmpl, {
          "id": row._id
          , "index": index++ + start
          , "name": row.layout.name
          , "editat": smart.date(row.editat)
          , "confirmby": row.user.name.name_zh
          , "viewer": get_viewerHtml(row)
          , "range": range
          , "class3": (row&&row.layout&&row.layout.image&&( !_.isEmpty(row.layout.image.imageH)|| !_.isEmpty(row.layout.image.imageV))) ? "" : "hidden"
          , "preview_image_H" :(row&&row.layout&&row.layout.image&& row.layout.image.imageH) ? row.layout.image.imageH : ""
          , "preview_image_V" :(row&&row.layout&&row.layout.image&& row.layout.image.imageV) ? row.layout.image.imageV : ""
          , "tmpSyn"  : tmpSyn
        }));
      });

    //
    } else if (status == 22) {
      var headerHtml = "<tr><th>#</th><th>" + i18n["js.public.info.layoutlist.tableheader.name"]
        + "</th><th>" + i18n["html.label.layout.viewer"]
        + "</th><th>" + i18n["html.label.layout.range"]
        + "</th><th>" + i18n["js.public.info.layoutlist.tableheader.applyby"]
        + "</th><th>" + i18n["js.public.info.layoutlist.tableheader.applyat"]
        + "</th><th>" + i18n["html.label.common.operation"] + "</th></tr>";
      $('#layout_header').html(headerHtml);

      var tmpl = $('#tmpl_confirmlayout_list').html();

      _.each(layoutList, function(row){
        var tmpSyn = null;
        for(var i = 0 ; ((row&&row.layout&&row.layout.page)&&(i < row.layout.page.length)); i++)
        {
            if(row.layout.page[i].type == '2'&&row.layout.page[i].tile[0]){
                tmpSyn = row.layout.page[i].tile[0].syntheticId;
            }
        }

        var range = "";
        if(row.openEnd){
          range = smart.date(row.openStart) + ' - ' + smart.date(row.openEnd);
        } else {
          range = i18n["html.label.layout.range.forever"];
        }
        container.append(_.template(tmpl, {
          "id": row._id
          , "index": index++ + start
          , "name": row.layout.name
          , "viewer": get_viewerHtml(row)
          , "range": range
          , "applyat": smart.date(row.applyat)
          , "editby": row.user.name.name_zh
          , "class3": (row&&row.layout&&row.layout.image&&( !_.isEmpty(row.layout.image.imageH)|| !_.isEmpty(row.layout.image.imageV))) ? "" : "hidden"
          , "preview_image_H" :(row&&row.layout&&row.layout.image&& row.layout.image.imageH) ? row.layout.image.imageH : ""
          , "preview_image_V" :(row&&row.layout&&row.layout.image&& row.layout.image.imageV) ? row.layout.image.imageV : ""
          , "tmpSyn"  : tmpSyn
        }));
      });

    } else {

      var tmpl = $('#tmpl_layout_list').html()
        , canedit, canapply, cancopy, candelete
        , canMakeContents = parseInt($("#authorityContents").val());

      if (!canMakeContents) {
        canedit = canapply = cancopy = candelete = "hidden";
      }

      _.each(layoutList, function(row){
        var tmpSyn = null;
        for(var i = 0 ; ((row&&row.layout&&row.layout.page)&&(i < row.layout.page.length)); i++)
        {
            if(row.layout.page[i].type == '2'&&row.layout.page[i].tile[0]){
                tmpSyn = row.layout.page[i].tile[0].syntheticId;
            }

        }

        container.append(_.template(tmpl, {
          "id": row._id
          , "index": index++ + start
          , "name": row.layout.name
          , "status": get_status(row.status)
          , "publish": get_publish(row.publish)
          , "viewer": get_viewerHtml(row)
          , "editat": smart.date(row.editat)
          , "editby": row.user.name.name_zh
          , "class1": row.status == 2 || canedit ? "hidden" : ""
          , "class2": row.status != 1 || canapply ? "hidden" : ""
          , "class3": cancopy
          , "class4": (row.publish == 1 || row.status == 2) || candelete ? "hidden" : ""
          , "class5": (row && row.layout && row.layout.image && (!_.isEmpty(row.layout.image.imageH)||!_.isEmpty(row.layout.image.imageV))) ? "" : "hidden"
          , "preview_image_H" :(row&&row.layout&&row.layout.image&& row.layout.image.imageH) ? row.layout.image.imageH : ""
          , "preview_image_V" :(row&&row.layout&&row.layout.image&& row.layout.image.imageV) ? row.layout.image.imageV : ""
          , "tmpSyn"  : tmpSyn
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

  function get_viewerHtml(layout) {
    layout = layout.active ? layout.active: layout;

    return new UserView().render.cellHtml({
          group: layout.viewerGroupsList,
          user: layout.viewerUsersList
        });
  }

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
      , imageV = target.attr("imageV")
      , synthetic_id = target.attr("synthetic_id")
      , layoutId= target.attr("layoutId");  // 公式レイアウトのlayoutId

    if (operation == "edit") {
      window.location = "/content/layout/edit/" + rowid;
    }

    if (operation == "delete") {
        Alertify.dialog.labels.ok = i18n["js.common.dialog.ok"];
        Alertify.dialog.labels.cancel = i18n["js.common.dialog.cancel"];
        Alertify.dialog.confirm(i18n["js.common.delete.confirm"], function () {

            // OK
            smart.dodelete("/layout/remove.json", {"id": rowid}, function(err, result){
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

    if (operation == "repeal") {
      Alertify.dialog.labels.ok = i18n["js.common.dialog.ok"];
      Alertify.dialog.labels.cancel = i18n["js.common.dialog.cancel"];
      Alertify.dialog.confirm(i18n["js.common.repeal.confirm"], function () {

        // OK
        smart.dodelete("/layout/remove.json", {"id": rowid, "layoutId": layoutId}, function(err, result){
          if (smart.error(err,i18n["js.common.repeal.error"], false)) {

          } else {
            render(0, 20);
            Alertify.log.success(i18n["js.common.repeal.success"]);
          }
        });
      }, function () {
        // Cancel
      });
    }

    if (operation == "copy") {
      window.location = "/content/layout/copy/" + rowid;
    }

    if (operation == "apply") {
      var toggleOpento = function(val) {
        if (val == 1) {
          $("#openrange").show();
        } else {
          $("#openrange").hide();
        }
      }
      new ButtonGroup("inputOpenRange", 0, toggleOpento).init(toggleOpento);
       
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
            var files_H = [];
            var case_images = {};
            if(imageH || imageV){
                files_H.push(imageH);
                if(imageV&&synthetic_id){
                    case_images.case_menu = imageV;
                    smart.dopost("/content/synthetic/getstore.json",{"synthetic_id": synthetic_id},   function(err,result) {
                        if(result) {
                            case_images.case_image = result.data.items.metadata[0].material.fileid;
                        }
                    });
                }

                $("#slide_V").css("display","none");
                $("#slide_H").css("display","block");
                $("#img_V").css("display","none");
                $("#img_H").css("display","block");
                new ButtonGroup("switchHV", 0).init();
                var tmpl_H = $('#tmpl_slide_H').html();
                $("#slide_H").html("");
                $("#slide_H").append(_.template(tmpl_H, { files: files_H , count: files_H.length }));
                var tmpl_V = $('#tmpl_slide_V').html();
                $("#slide_V").html("");
                $("#slide_V").append(_.template(tmpl_V, { imgs: case_images }));
                $("#page").addClass("active");
                $("#slide_H").addClass("active");
                $("#slide_V").addClass("active");
                $("#page1").addClass("active");
                $("#slide1").addClass("active");
                $("#syntheticModal").modal("show");
                $("#btn_H").on("click",function(){
                   $("#btn_H").addClass("btn-white");
                   $("#slide_H").css("display","none");
                   $("#slide_V").css("display","block");
                   $("#img_H").css("display","none");
                   $("#img_V").css("display","block");
                });
                $("#btn_V").on("click",function(){
                    $("#btn_V").addClass("btn-white");
                    $("#slide_V").css("display","none");
                    $("#slide_H").css("display","block");
                    $("#img_V").css("display","none");
                    $("#img_H").css("display","block");
                });
            } else {
                Alertify.log.error(i18n["js.public.error.layoutlist.preview"]);
            }
  }
      return false;
  });
}
