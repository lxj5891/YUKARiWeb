$(function () {
  'use strict';
  render(0,15);
  events();
});

// 保持一览数据
var companyList;

function render(start, count, keyword) {

  keyword = keyword ? encodeURIComponent(keyword) : "";
  smart.doget("/company/list.json?type=all&count=" + count + "&start=" + start +"&keyword=" + keyword, function(e, result){

    companyList = result.items;

    var tmpl = $('#tmpl_company_list').html()
      , container = $("#company_list")
      , index = 1;

    container.html("");
    _.each(result.items, function(row){
      container.append(_.template(tmpl, {
          "index": index++ + start
        , "type": row.companyType
        , "_id": row._id
        , "name": row.name
        , "kana": row.kana
        , "tel": row.tel
        , "address": row.address
        , "mail": row.mail
        , "createat": smart.date(row.createat)
        , "active": row.active
      }));
    });
    if(result.items.length == 0)
    {
        container.html(i18n["js.common.list.empty"]);
    }
      // 设定翻页
      smart.pagination($("#pagination_area"), result.totalItems, count, function(active, rowCount){
          render.apply(window, [active, count]);
      });
  });
}



function events() {
  $("#doSearchCompany").bind("click",function(){
    var _keyword = '';
    _keyword =  $("#company_search").val();
    smart.paginationInitalized = false;
    render(0, 20,_keyword);
  });

  $("#company_search").bind("change",function(){
    var _keyword = '';
    _keyword =  $("#company_search").val();
    smart.paginationInitalized = false;
    render(0, 20,_keyword);
  });

  // 一览按钮
  $("#company_list").on("click", "a", function(event){
    var operation = $(event.target).attr("operation")
      , index = $(event.target).attr("index")
      , row = companyList[index - 1];
    // 编辑按钮
    if (operation == "edit") {
      window.location = "/admin/company/edit/" + row._id;
    }
    //删除按钮
    if (operation == "delete") {
      var company = {
        id : row._id
      };
      smart.doput("/company/remove.json",company, function(err, result){
        if (err) {
          Alertify.log.error(i18n["js.common.delete.error"]);
        } else {
          render(0, 15);
        }
      });
    }

    // 无效按钮
    if (operation == "active") {
      var company = {
          id: row._id,
          active: (row.active == 1) ? 0:1
      };
      smart.doput("/company/active.json",company, function(err, result){
        if (err) {
          Alertify.log.error(i18n["js.common.update.error"]);
        } else {
          render(0, 15);
        }
      });
    }
    return false;
  });
}
