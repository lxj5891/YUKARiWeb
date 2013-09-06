$(function () {
  'use strict';
  render(0,15);
});

// 保持一览数据
var companyinfoList;
/**
 * 绘制画面
 */
function render(start,count) {

  smart.doget("/operated/list.json?type=all&count=" + count + "&start=" + start, function(e, result){
    companyinfoList = result.items;
    var tmpl = $('#tmpl_companyinfo_list').html()
      , container = $("#companyinfo_list")
      , index = 1;
    container.html("");
    _.each(result.items, function(row){
      container.append(_.template(tmpl, {
        "index": index++
        , "compid": row._id
        , "compname": row.name
        , "adminid" : row.mail
        , "userCount": row.userCount
        , "deviceCount": row.deviceCount
      }));
    });

    // 设定翻页
    smart.pagination($("#pagination_area"), result.totalItems, count, function(active, rowCount){
      render.apply(window, [active, count]);
    });
  });
}
