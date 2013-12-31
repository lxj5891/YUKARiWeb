$(function () {
  'use strict';

  render(0, 20);
  event();
});

function render(start, count,keyword) {
  if(!keyword){
    keyword = '';
  }
  smart.doget("/notice/list.json?count=" + count + "&start=" + start + "&keyword=" + keyword, function(err, result){

    if (err) {
      smart.error(err,i18n["js.common.search.error"],false);
    } else {
      // 一览表示
      var tmpl = $('#tmpl_notice_list').html()
        , container = $("#notice_list")
        , index = 1;
      container.html("");

      _.each(result.items, function(row){
        container.append(_.template(tmpl, {
          "index": index++ + start
          , "sendto": new UserView().render.cellHtml(row.sendto)
          , "title": row.title
          , "notice": row.notice.replace('\n','<br>')
          , "createat": smart.date(row.createat)
          , "createby": row.user.name.name_zh
        }));
      });
      if(!result.items||result.items.length == 0 ){
        container.html(i18n["js.common.list.empty"]);
      }
      // paging
      smart.pagination($("#pagination_area"), result.totalItems, count, function(active, rowCount){
        render.apply(window, [active, count]);
      });
    }


  });
}
function event(){
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
}