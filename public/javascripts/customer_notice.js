var _start = 0;
var _count = 20;
var _keyword = '';

$(function () {
  'use strict';

  render(0, 20);
  event();
});

function render(start, count,keyword) {
  if(!keyword){
    keyword = '';
  }
  smart.doget("/notice/list.json?count=" + count + "&start=" + start + "&keyword=" + keyword, function(e, result){

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
    if(!result.items||result.items.length == 0 ){
      container.html("没有记录");
    }
    // paging
    smart.pagination($("#pagination_area"), result.totalItems, count, function(active, rowCount){
      render.apply(window, [active, count]);
    });

  });
}
function event(){
  $("#txt_search").bind("change",function(){
    _keyword =  $("#txt_search").val();
    smart.paginationInitalized = false;
    render(_start, _count,_keyword);
  });

  $("#doSearch").bind("click",function(){
    _keyword =  $("#txt_search").val();
    smart.paginationInitalized = false;
    render(_start, _count,_keyword);
  });
}