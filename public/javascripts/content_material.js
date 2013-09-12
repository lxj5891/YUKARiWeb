
$(function () {
  'use strict';
  render(0, 20);
  events();

  smart.view("tag").view.initialize("textBoxTag");

  // 获取Tag一览
  smart.doget("/tag/search.json?count=20&start=0", function(err, result){

    var tmpl = $('#tmpl_tag_item').html()
      , container = $("#taglist");

    container.html("");
    _.each(result, function(row){
      container.append(_.template(tmpl, {tag: row.name}));
    });
  });

});

// 保持一览数据
var _materialList;

/**
 * 注册事件
 */
function events() {
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
  // 一览显示
  $("#showlist").bind("click", function(e){
    $("#list").show();
    $("#grid").hide();
  });

  // 格子状显示
  $("#showgrid").bind("click", function(e){
    $("#list").hide();
    $("#grid").show();
  });

  // 上传
  $("#selectFile").bind("click", function(){
    $("#uploadfile").trigger('click');
  });
  $("#uploadfile").bind("change", function(event){
    uploadFiles(event.target.files);
  });

  // 格状显示的图片点击
  $("#material_grid").on("click", "a", function(event){
    var index = $(event.target).attr("index");

    renderDialog(_materialList[index - 1], index);
    $('#material_detail_dlg').modal("show");
    return false;
  });

  // 关闭对话框时隐藏检索结果
  $('#material_detail_dlg').on('hide.bs.modal', function () {
    smart.view("tag").view.hide();
  })

  // 一览按钮
  $("#material_list").on("click", "a", function(event){

    var operation = $(event.target).attr("operation")
      , index = $(event.target).attr("index")
      //DONE: 素材bug  11  不能删除素材
      , it = parseInt(index) % 20 == 0 ? 20 : parseInt(index) % 20
      , row = _materialList[it - 1 ];


    // 编辑按钮
    if (operation == "edit") {
      renderDialog(row, it);
      $('#material_detail_dlg').modal("show");
    }

    // 删除按钮
    if (operation == "delete") {

      Alertify.dialog.confirm(i18n["js.common.delete.confirm"], function () {

        // OK
        smart.dodelete("/material/remove.json", {"fid": row._id}, function(err, result){
          if(err){
            Alertify.log.error( i18n["js.public.check.material.delete"]); console.log(err);
          } else {
            render(_start, _count);
            Alertify.log.success(i18n["js.common.delete.success"]);
          }
        });
      }, function () {
        // Cancel
      });
    }
    return false;
  });

  // 替换文件
  $("#btnUploadFile").bind("click", function(event){
    $("#updatefile").trigger('click');
  });
  $("#updatefile").bind("change", function(event){
    var index = $(event.target).attr("index");
    updateFiles(index, event.target.files);
  });

  // 保存文件
  $("#btnSave").bind("click", function(event){

    var tag = [];
    $("#textBoxTag li").each(function(index){
      tag.push($(this).attr("tagname"));
    });

    var index = $(this).attr("index")
      , row = _materialList[index - 1];

    smart.doput("/material/updatetag.json", {fid: row._id, tags: tag.join(",")}, function(err, result) {
      if(err){
        Alertify.log.error(i18n["js.common.update.error"]); console.log(err);
      } else {
        smart.paginationInitalized = false;
        render(_start, _count);
        Alertify.log.success(i18n["js.common.update.success"]);
      }
    });
  });

  // 切换Tag
  $("#taglist").on("click", "li", function(){
    smart.paginationInitalized = false;
    var item = $(this).find("a");
    if (item.hasClass("selected_tag")) {
      item.removeClass("selected_tag");
    } else {
      item.addClass("selected_tag");
    }

    render(_start, _count);
  });

}

/**
 * 显示对话框
 */
function renderDialog(row, index) {
  $('#inputName').val(row.filename);
  $('#inputSize').val(Math.round(row.length / 1024) + " KB");
  $('#inputEditBy').val(row.user.name.name_zh);
  $('#inputEditAt').val(smart.date(row.editat));
  $('#updatefile').attr("index", index);
  $('#btnSave').attr("index", index);
  $('#material_detail').attr("src", "/picture/" + row.fileid);

  var tag = smart.view("tag").view;
  tag.setDefaults(row.tags);
}

/**
 * 绘制画面
 */
function render(start, count,keyword) {

  var tags = [];
  _.each($("#taglist").find(".selected_tag"), function(item){
    tags.push($(item).html());
  });
  if(!keyword){
    keyword = '';
  }
  smart.doget("/material/list.json?count=" + count + "&start=" + start + "&tags=" + tags.join(",") + "&keyword="+keyword, function(e, result){

    _materialList = result.items;

    // 一览表示
    var tmpl_list = $('#tmpl_material_list').html()
      , container_list = $("#material_list")
      , index = 1;

    container_list.html("");
    _.each(_materialList, function(row){
      container_list.append(_.template(tmpl_list, {
          "index": index++ + start
        , "fid": row._id
        , "file": row.thumb ? row.thumb.middle : row.fileid
        , "type": row.contentType
        , "filename": row.filename
        , "size": Math.round(row.length / 1024) + " KB"
        , "editat": smart.date(row.editat)
        , "editby": row.user.name.name_zh
      }));
    });
    if(_materialList.length == 0 ){
      container_list.html("没有记录");
    }

    // 格状表示
    var cols = []
      , container_grid = $("#material_grid")
      , tmpl_grid = $('#tmpl_material_grid').html()
      , colindex = 0;

    index = 1;
    _.each(_materialList, function(row){
      colindex = colindex >= 4 ? 0 : colindex;

      cols[colindex] = cols[colindex] || [];
      cols[colindex].push({
          "index": index++
        , "fid": row._id
        , "file": row.thumb ? row.thumb.middle : row.fileid
        , "type": row.contentType
        , "filename": row.filename
        , "size": Math.round(row.length / 1024) + " KB"
        , "editat": smart.date(row.editat)
        , "editby": row.user.name.name_zh
      });

      colindex++;
    });

    container_grid.html("");
    container_grid.append(_.template(tmpl_grid, {"cols": cols}));

    // 设定翻页
    smart.pagination($("#pagination_area"), result.totalItems, count, function(active, rowCount){
      render.apply(window, [active, count]);
    });

  });
}

/**
 * 上传图片
 */
/**根据文件头信息判断文件类型

 var filename = null;
 for (var i = 0 ; i < result.data.items.length ; i++)
 {
     if((typeof (result.data.items[i]) == 'string')&&result.data.items[i].constructor == String){
         var filepath = result.data.items[i];
         var filename = filepath.split(":")[1];
     }
 }
 */
function uploadFiles(files) {
  if (!files || files.length <= 0) {
    return false;
  }
  for (var i = 0; i < files.length; i++) {
      var filetype = files[i].type.split("/");
      if(filetype[0] != "image"  &&  !(filetype[0] == "video" && filetype[1] == "mp4") ){
          Alertify.log.error(i18n["js.common.upload.error"]); console.log(err);
          return ;
      }
  }

  var fd = new FormData();
  for (var i = 0; i < files.length; i++) {
    fd.append("files", files[i]);
  }

  // 显示进度条
  $("#upload_progress_dlg").modal("show");

  // 发送文件
  smart.dopostData("/material/add.json", fd,
    function(err, result){

      $("#upload_progress_dlg").modal("hide");
      if(err){
        Alertify.log.error(i18n["js.common.upload.error"]); console.log(err);
      } else {
          render(_start, _count);
          Alertify.log.success(i18n["js.common.upload.success"]);
      }
    },
    function(progress){
      $("#upload_progress_bar").css("width", progress + "%");
    }
  );
}

// 更新文件
function updateFiles(index, files) {
  if (!files || files.length <= 0) {
    return false;
  }

  var fd = new FormData();
  fd.append("fid", _materialList[index - 1]._id);
  for (var i = 0; i < files.length; i++) {
    fd.append("files", files[i]);
  }

  // 显示进度条
  $("#upload_progress_dlg").modal("show");

  // 发送文件
  smart.dopostData("/material/updatefile.json", fd,
    function(err, result){

      $("#upload_progress_dlg").modal("hide");
      if (err) {
        Alertify.log.error(i18n["js.common.replace.error"]); console.log(err);
      } else {

        render(_start, _count);
        renderDialog(result.data.items, index);
        Alertify.log.success(i18n["js.common.replace.success"]);
      }
    },
    function(progress){
      $("#upload_progress_bar").css("width", progress + "%");
    }
  );
}