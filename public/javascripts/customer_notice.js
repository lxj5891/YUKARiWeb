
$(function () {
  'use strict';

  render();
});

function render(start, count) {

  smart.doget("/notice/list.json?count=" + count + "&start=" + start, function(e, result){

    // 一览表示
    var tmpl = $('#tmpl_notice_list').html()
      , container = $("#notice_list")
      , index = 1;

    console.log(result);
    //container.html("");

    _.each(result.items, function(row){

      var sendto = new Array();
console.log(row);
      _.each(row.sendto, function(user) {
        sendto.push(user.name.name_zh);
      });

      container.append(_.template(tmpl, {
        "index": index++
        , "sendto": sendto.join("<br>")
        , "title": row.title
        , "notice": row.notice.replace('\n','<br>')
        , "createat": smart.date(row.createat)
        , "createby": row.user.name.name_zh
      }));
    });

    // paging
    // smart.pagination($("#pagination_area"), result.totalItems, count, function(active, rowCount){
    //     render.apply(window, [active, count]);
    // });

  });
}
