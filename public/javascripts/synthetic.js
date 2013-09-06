
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
    return "アニメーション画像";
  } else if(type == this._synthetic_type.normal){
    return "画像セット";
  } else if(type == this._synthetic_type.gallery){
    return "ギャラリー";
  } else if(type == this._synthetic_type.CaseView){
    return "ケースビュー";
  }
  return
}
function render(start, count) {

  smart.doget("/synthetic/list.json?count=" + count + "&start=" + start, function(e, result){

    var syntheticList = result.items;

    // 一览表示
    var tmpl = $('#tmpl_synthetic_list').html()
      , container = $("#synthetic_list")
      , index = 1;

    console.log(syntheticList);
    container.html("");

    _.each(syntheticList, function(row){
      var f = row.cover && row.cover.length > 0 ? "/picture/" + row.cover_material.fileid : "/images/empty.png";
      if(row.cover_material && row.cover_material.thumb){
        f = "/picture/" + row.cover_material.thumb.middle;
      }
      container.append(_.template(tmpl, {
          "id": row._id
        , "index": index++
        , "name": row.name
        , "page": row.page
        , "type": type_redner(row.type)
        , "cover": f
        , "editat": smart.date(row.editat)
        , "editby": row.user.name.name_zh
      }));
    });

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
  $("button[name=okSetting]").on("click", function (e) {
    var _name = $("input[name=name]").val();
    var _type = $("input[name=type]:checked").val();
    var _thumb_type = $("input[name=thumb_type]").val();

    var _data = {
      name: _name,
      type: _type,
      thumb_type: _thumb_type
    };

    smart.dopost("/content/synthetic/save.json", _data, function (e, result) {
      window.location.href="/content/synthetic/edit/"+result.data.items._id;
    });
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
      Alertify.dialog.confirm("削除します。よろしいですか？", function () {

        // OK
        smart.dodelete("/synthetic/remove.json", {"id": rowid}, function(err, result){
          if (err) {
            Alertify.log.error("削除に失敗しました。"); console.log(err);
          } else {
            render(0, 20);
            Alertify.log.success("削除しました。");
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
          Alertify.log.error("コピーに失敗しました。"); console.log(err);
        } else {
          render(0, 20);
          Alertify.log.success("コピーしました。");
        }
      });
    }

    return false;
  });
}