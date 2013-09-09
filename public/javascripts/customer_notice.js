
$(function () {
  'use strict';

  render(0, 20);
});

function render(start, count) {

  smart.doget("/notice/list.json?count=" + count + "&start=" + start, function(e, result){

    // 一览表示
    var tmpl = $('#tmpl_notice_list').html()
      , container = $("#notice_list")
      , index = 1;
    container.html("");

    _.each(result.items, function(row){

      var sendto = new Array();

      _.each(row.sendto.user, function(user) {
        sendto.push("<i class=\"icon-male\"></i>&nbsp;&nbsp;"+user.name.name_zh);
      });

      _.each(row.sendto.group, function(group) {
        sendto.push("<i class=\"icon-group\"></i>&nbsp;&nbsp;"+group.name.name_zh);
      });

      container.append(_.template(tmpl, {
        "index": index++ + start
        , "sendto": sendto.join("<br>")
        , "title": row.title
        , "notice": row.notice.replace('\n','<br>')
        , "createat": smart.date(row.createat)
        , "createby": row.user.name.name_zh
      }));
    });

    // paging
    smart.pagination($("#pagination_area"), result.totalItems, count, function(active, rowCount){
      render.apply(window, [active, count]);
    });

  });
}
