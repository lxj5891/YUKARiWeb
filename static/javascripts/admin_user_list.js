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

  smart.doget("/admin/user/list.json?type=all&count=" + count + "&start=" + start + "&keyword=" + keyword, function (err, result) {

    if (err) {
      smart.error(err,i18n["js.common.search.error"],false);
    } else {
      userList = result;

      var tmpl = $('#tmpl_user_list').html()
        , container = $("#user_list")
        , index = 1;

      container.html("");
      _.each(userList, function (row) {
        container.append(_.template(tmpl, {
          "index": index++ + start,
          "id": row._id,
          "uid": row.userName,
          "name": row.first,
          "title": row.extend.title,
          "telephone": row.extend.tel,
          "description": row.extend.description,
          "contents": row.extend.authority ? row.extend.authority.contents : "0",
          "active": row.extend.active,
          "type": row.extend.type,
          "companycode":row.companycode,
          "path":row.path
        }));
      });
    }

  });
}

function events() {
    // 一览按钮
    $("#user_list").on("click", "a", function(event){

        var operation = $(event.target).attr("operation")
            , index = $(event.target).attr("index")
            , row = userList[index - 1];

        // 编辑按钮
        if (operation == "edit") {
            window.location = "/super/user/edit/" + row.companycode + "/" + row._id;
        }

        // 无效按钮
        if (operation == "active") {
            var userinfo = {
                uid: row._id
               ,extendKey:"active"
               ,extendValue:(row.extend.active == "1") ? "0" : "1"
               ,companycode : row.companycode
            };
            smart.doput("/admin/user/updateActive.json",userinfo, function(err, result){
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
