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
    if(!keyword){
        keyword = '';
    }
    smart.doget("/user/list.json?type=all&count=" + count + "&start=" + start + "&keyword=" + keyword, function(e, result){

        userList = result.items;

        var tmpl = $('#tmpl_user_list').html()
            , container = $("#user_list")
            , index = 1;

        container.html("");
        _.each(result.items, function(row){
            container.append(_.template(tmpl, {
                "index": index++ + start
                , "id": row._id
                , "uid": row.uid
                , "name": row.name ? row.name.name_zh:""
                , "title": row.title
                , "telephone": row.tel ? row.tel.telephone : ""
                , "description": row.description
                , "notice": row.authority ? row.authority.notice:""
                , "approved":row.authority ? row.authority.approve : ""
                , "active": row.active
                , "type": row.type
            }));
        });
        if(result.items.length == 0){
            container.html("没有记录");
        }
        // 设定翻页
        smart.pagination($("#pagination_area"), result.totalItems, count, function(active, rowCount){
            render.apply(window, [active, count]);
        });
    });
}
var _start = 0;
var _count = 15;
var _keyword = '';
function events() {
    $("#doSearchUser").bind("click",function(){
        _keyword =  $("#user_search").val();
        smart.paginationInitalized = false;
        render(_start, _count,_keyword);
    });

    $("#user_search").bind("change",function(){
        var _keyword =  $("#user_search").val();
        smart.paginationInitalized = false;
        render(_start, _count,_keyword);
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
                    console.log(err);
                } else {
                    render(0, 15);
                }
            });
        }
        return false;
    });
}
