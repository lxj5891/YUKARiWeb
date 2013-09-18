$(function () {
    'use strict';
    render(0,15);
    events();
});

// 保持一览数据
var userList;
/**
 * 绘制画面
 */
function render(start, count ,keyword) {
  keyword = keyword ? encodeURIComponent(keyword) : "";

  smart.doget("/user/list.json?type=all&count=" + count + "&start=" + start + "&keyword=" + keyword, function (err, result) {

    if (err) {
      smart.error(err,i18n["js.common.search.error"],false);
    } else {
      userList = result.items;

      var tmpl = $('#tmpl_user_list').html()
        , container = $("#user_list")
        , index = 1;

      container.html("");
      _.each(result.items, function (row) {
        smart.doget("/user/findOne.json?userid=" + row.editby , function(err, userinfo) {
           if (err) {
             smart.error(err,i18n["js.common.search.error"],false);
           } else {
             var companycode;
             if (userinfo) {
               companycode = userinfo.companycode;
             } else {
               companycode = "";
             }
             container.append(_.template(tmpl, {
               "index": index++ + start,
               "id": row._id,
               "uid": row.uid,
               "name": row.name ? row.name.name_zh : "",
               "title": row.title,
               "telephone": row.tel ? row.tel.telephone : "",
               "description": row.description,
               "contents": row.authority ? row.authority.contents : "0",
               "notice": row.authority ? row.authority.notice : "0",
               "approved": row.authority ? row.authority.approve : "0",
               "active": row.active,
               "type": row.type,
               "companycode":companycode
             }));
           }
        });

      });
      if (result.items.length == 0) {
        container.html(i18n["js.common.list.empty"]);
      }
      // 设定翻页
      smart.pagination($("#pagination_area"), result.totalItems, count, function (active, rowCount) {
        render.apply(window, [active, count]);
      });
    }

  });
}

function events() {
    $("#doSearchUser").bind("click",function(){
        var _keyword = '';
        _keyword =  $("#user_search").val();
        smart.paginationInitalized = false;
        render(0, 20,_keyword);
    });

    $("#user_search").bind("change",function(){
        var _keyword = '';
        _keyword =  $("#user_search").val();
        smart.paginationInitalized = false;
        render(0, 20,_keyword);
    });
    // 一览按钮
    $("#user_list").on("click", "a", function(event){

        var operation = $(event.target).attr("operation")
            , index = $(event.target).attr("index")
            , row = userList[index - 1];

        // 编辑按钮
        if (operation == "edit") {
            window.location = "/customer/user/edit/" + row._id;
        }

        // 无效按钮
        if (operation == "active") {
          var activeTemp;
          if (row.active == "1") {
            activeTemp="0";
          } else {
            activeTemp ="1";
          }
            var userinfo = {
                id: row._id,
                active: activeTemp
            };
            smart.doput("/user/update.json",userinfo, function(err, result){
                if (err) {
                  smart.error(err,i18n["js.common.update.error"],false);
                } else {
                    render(0, 15);
                }
            });
        }
        return false;
    });
}
