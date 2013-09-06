

$(function () {
  'use strict';

  render(0, 20);
  events();

});

//// 保持一览数据
//var groupList;
/**
 * 绘制画面
 */
function render(start, count) {

  smart.doget("/group/list.json?count=" + count + "&start=" + start, function(e, result){

    var groupList = result.items;

    // 一览表示
    var tmpl = $('#tmpl_group_list').html()
      , container = $("#group_list")
      , index = 1;

    console.log(groupList);
    container.html("");

    _.each(groupList, function(row){

      container.append(_.template(tmpl, {
          "id": row._id
        , "index": index++
        , "name": row.name.name_zh
        , "members": row.member.length
        , "description": row.description
        , "editat": smart.date(row.editat)
      }));
    });

    // 设定翻页
    smart.pagination($("#pagination_area"), result.totalItems, count, function(active, rowCount){
      render.apply(window, [active, count]);
    });

  });

}

function events() {
  // 一览按钮
  $("#group_list").on("click", "a", function(event){

    var operation = $(event.target).attr("operation")
      , index = $(event.target).attr("index")
      , row = groupList[index - 1];

    // 编辑按钮
    if (operation == "edit") {
      window.location = "/customer/group/edit/" + row._id;
    }

    // 删除按钮
    if (operation == "delete") {
      var group = {
        _id: row._id,
        valid : 0
      };
      smart.doput("/group/update.json",group, function(err, result){
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