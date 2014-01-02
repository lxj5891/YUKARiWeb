$(function () {
  'use strict';
  render(0,20);
  events();
});

// 保持一览数据
var companyList;

function render(start, count, keyword) {

  keyword = keyword ? encodeURIComponent(keyword) : "";
  smart.doget("/company/list.json?type=all&count=" + count + "&start=" + start +"&keyword=" + keyword, function(err, result){

    if (err) {
      smart.error(err,i18n["js.common.search.error"],false);
    } else {
      companyList = result.items;
      var tmpl = $('#tmpl_company_list').html()
        , container = $("#company_list")
        , index = 1;

      container.html("");

      _.each(result.items, function(row){
        container.append(_.template(tmpl, {
          "index": index++ + start
          , "type": row.type
          , "_id": row.domain
          , "name": row.name
          , "kana": row.extend.kana
          , "tel": row.tel
          , "address": row.address
          , "mail":row.userName
          , "createat": smart.date(row.createAt)
          , "active": row.extend.active
          , "code" : row.code
        }));
      });
      if(companyList.length == 0) {
        container.html(i18n["js.common.list.empty"]);
      }
      // 设定翻页
      smart.pagination($("#pagination_area"), result.totalItems, count, function(active, rowCount){
        render.apply(window, [active, count,keyword]);
      });
    }
  });
}



function events() {
  $("#doSearchCompany").bind("click",function(){
    var _keyword = '';
    _keyword =  $("#company_search").val();
    smart.paginationInitalized = false;
    render(0, 15,_keyword);
  });

  $("#company_search").bind("change",function(){
    var _keyword = '';
    _keyword =  $("#company_search").val();
    smart.paginationInitalized = false;
    render(0, 15,_keyword);
  });

  // 一览按钮
  $("#company_list").on("click", "a", function(event){
    var operation = $(event.target).attr("operation")
      , index = $(event.target).attr("index")
      , row = companyList[index - 1];
    // 编辑按钮
    if (operation == "edit") {
      window.location = "/super/company/edit/" + row._id;
    }
    // 无效按钮

    if (operation == "active") {
      var company = {
          id: row._id,
          name:row.name,
          domain:row.domain,
          type:row.type,
          updater:row.userName,
          extend: { active : (row.extend.active == "1" ? "0" : "1")},
          code : row.code
      };

      smart.doput("/company/active.json",company, function(err, result){
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
