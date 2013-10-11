
$(function () {
  'use strict';
  render(0, 20);
  events();

  smart.view("tag").view.initialize("textBoxTag");

  // 获取Tag一览
  smart.doget("/tag/search.json?count=20&start=0", function(err, result){

    if(err){
      return;
    }
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
      Alertify.dialog.labels.ok = i18n["js.common.dialog.ok"];
      Alertify.dialog.labels.cancel = i18n["js.common.dialog.cancel"];
      Alertify.dialog.confirm(i18n["js.common.delete.confirm"], function () {

        // OK
        smart.dodelete("/material/remove.json", {"fid": row._id}, function(err, result){
          if(smart.error(err,i18n["js.public.check.material.delete"],false)){
            return;
          } else {
            render(0, 20);
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

    var tag = []
      , inputTag = $("#inputTag");

    // 输入框输入的文字，也直接变成Tag
    if (inputTag.val().length > 0) {
      tag.push(inputTag.val());
    }

    $("#textBoxTag li").each(function(index){
      if ($(this).attr("tagname").length > 0) {
        tag.push($(this).attr("tagname"));
      }
    });

    var inputName = $("#inputName").val() + $("#extensions").val();
    var index = $(this).attr("index")
      , row = _materialList[index - 1];
    if($("#inputName").val()) {
        smart.doput("/material/edit.json", {fid: row._id, tags: tag.join(",") , fname:inputName}, function(err, result) {
          if(smart.error(err, i18n["js.common.search.error"], false)){

          } else {
            smart.paginationInitalized = false;
            render(0, 20);
            Alertify.log.success(i18n["js.common.update.success"]);
            $('#material_detail_dlg').modal("hide");
          }
        });
    } else {
      //  $('#material_detail_dlg').modal("hide");
        Alertify.log.error(i18n["js.common.update.error"]);
    }
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
    item.blur();

    render(0, 20);
  });

}

/**
 * 显示对话框
 */
function renderDialog(row, index) {
  $('#inputName').val(delExtension(row.filename));
  $('#extensions').val(row.filename.split(delExtension(row.filename))[1]);
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
 *正则表达式去除后缀
 */
function delExtension(str) {
    var reg = /\.\w+$/;
    return str.replace(reg,'');
}

/**
 * 绘制画面
 */
function render(start, count,keyword) {

  var tags = [];
  _.each($("#taglist").find(".selected_tag"), function(item){
    tags.push($(item).html());
  });

  keyword = keyword ? encodeURIComponent(keyword) : "";

  smart.doget("/material/list.json?count=" + count + "&start=" + start + "&tags=" + tags.join(",") + "&keyword=" + keyword, function (error, result) {

    if (smart.error(error, i18n["js.common.search.error"], true)) {
      return;
    }

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
      container_list.html(i18n["js.common.list.empty"]);
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
      if(smart.error(err, i18n["js.common.upload.error"], false)){
        return;
      } else {
          render(0, 20);
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
      if (smart.error(err, i18n["js.common.replace.error"], false)) {

      } else {

        render(0, 20);
        renderDialog(result.data.items, index);
        Alertify.log.success(i18n["js.common.replace.success"]);
      }
    },
    function(progress){
      $("#upload_progress_bar").css("width", progress + "%");
    }
  );
}