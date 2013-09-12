var _start = 0;
var _count = 20;
var _keyword = '';
$(function () {
  'use strict';

  render(0, 20);
  events();

});


/**
 * 绘制画面
 */
function type_redner(type){
  this._synthetic_type =  {imageWithThumb: "imageWithThumb", normal: 'normal', gallery: 'gallery', CaseView: "CaseView"};
  if(type == this._synthetic_type.imageWithThumb){
    return  i18n["js.public.info.synthetic.type.animation"];
  } else if(type == this._synthetic_type.normal){
    return i18n["js.public.info.synthetic.type.imageset"];
  } else if(type == this._synthetic_type.gallery){
    return i18n["js.public.info.synthetic.type.gallery"];
  } else if(type == this._synthetic_type.CaseView){
    return i18n["js.public.info.synthetic.type.caseview"];
  }
  return
}
function render(start, count,keyword) {
  keyword = keyword ? encodeURIComponent(keyword) : "";

  smart.doget("/synthetic/list.json?count=" + count + "&start=" + start + "&keyword=" + keyword, function (e, result) {

    var syntheticList = result.items;

    // 一览表示
    var tmpl = $('#tmpl_synthetic_list').html()
      , container = $("#synthetic_list")
      , index = 1;

    console.log(syntheticList);
    container.html("");

    _.each(syntheticList, function(row){
      var f = "";
      if(row.cover_material){
        if(row.cover_material.thumb){
          f = "/picture/" + row.cover_material.thumb.middle;
        }else{
          f = "/picture/" + row.cover_material.fileid;
        }

      }else{
        f = "/images/empty.png";
      }
      container.append(_.template(tmpl, {
          "id": row._id
        , "index": index++ + start
        , "name": row.name
        , "page": row.page
        , "type": type_redner(row.type)
        , "cover": f
        , "editat": smart.date(row.editat)
        , "editby": row.user.name.name_zh
      }));
    });
    if(syntheticList.length == 0 ){
      container.html(i18n["js.common.list.empty"]);
    }
    // 设定翻页
    smart.pagination($("#pagination_area"), result.totalItems, count, function(active, rowCount){
      render.apply(window, [active, count]);
    });

  });

}

/**
 * 注册事件
 */
function events() {
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

  $("button[name=okSetting]").on("click", function (e) {
    var _type = $("input[name=type]:checked").val();
    window.location.href = "/content/synthetic/add/" + _type;
  });


  // 一览按钮
  $("#synthetic_list").on("click", "a", function(event){

    var operation = $(event.target).attr("operation")
      , rowid = $(event.target).attr("rowid");

    // 编辑按钮
    if (operation == "edit") {
      window.location = "/content/synthetic/edit/" + rowid;
    }

    // 删除按钮
    if (operation == "delete") {
      Alertify.dialog.confirm(i18n["js.common.delete.confirm"], function () {

        // OK
        smart.dodelete("/synthetic/remove.json", {"id": rowid}, function(err, result){
          if (err) {
            Alertify.log.error(i18n["js.common.delete.error"]); console.log(err);
          } else {
            render(0, 20);
            Alertify.log.success(i18n["js.common.delete.success"]);
          }
        });
      }, function () {
        // Cancel
      });
    }

    if (operation == "preview") {
       smart.dopost("/content/synthetic/getstore.json", {synthetic_id: rowid}, function(err, result){
         var files = [];
         _.each(result.data.items.metadata, function(item) {
           if (item && item.material && item.material.thumb && item.material.thumb.big) {
             files.push(item.material.thumb.big);
           } else {
             files.push(item.material.fileid);
           }
         }); console.log(files);

         var tmpl = $('#tmpl_slide').html();
         $("#slide").html("");
         $("#slide").append(_.template(tmpl, { files: files , count: files.length}));
         $("#page1").addClass("active");
         $("#slide1").addClass("active");
         $("#syntheticModal").modal("show");
       });
    }

    if (operation == "copy") {
      smart.dopost("/synthetic/copy.json", {"id": rowid}, function(err, result){
        if (err) {
          Alertify.log.error(i18n["js.common.copy.error"]); console.log(err);
        } else {
          render(0, 20);
          Alertify.log.success(i18n["js.common.copy.success"]);
        }
      });
    }

    return false;
  });
}