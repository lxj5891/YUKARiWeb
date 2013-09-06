
$(function () {
  'use strict';

  render(_start, _count);
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
var _start = 0;
var _count = 20;

/**
 * 注册事件
 */
function events() {

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
      , row = _materialList[index - 1];

    // 编辑按钮
    if (operation == "edit") {
      renderDialog(row, index);
      $('#material_detail_dlg').modal("show");
    }

    // 删除按钮
    if (operation == "delete") {
      Alertify.dialog.confirm("削除します。よろしいですか？", function () {

        // OK
        smart.dodelete("/material/remove.json", {"fid": row._id}, function(err, result){
          if (err) {
            Alertify.log.error("素材が既に使用されているため、削除できません。"); console.log(err);
          } else {
            render(_start, _count);
            Alertify.log.success("削除しました。");
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
      if (err) {
        Alertify.log.error("更新失敗しました。"); console.log(err);
      } else {
        render(_start, _count);
        Alertify.log.success("更新しました。");
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
function render(start, count) {

  var tags = [];
  _.each($("#taglist").find(".selected_tag"), function(item){
    tags.push($(item).html());
  });

  smart.doget("/material/list.json?count=" + count + "&start=" + start + "&tags=" + tags.join(","), function(e, result){

    _materialList = result.items;

    // 一览表示
    var tmpl_list = $('#tmpl_material_list').html()
      , container_list = $("#material_list")
      , index = 1;

    container_list.html("");
    _.each(_materialList, function(row){
      container_list.append(_.template(tmpl_list, {
          "index": index++
        , "fid": row._id
        , "file": row.thumb ? row.thumb.middle : row.fileid
        , "type": row.contentType
        , "filename": row.filename
        , "size": Math.round(row.length / 1024) + " KB"
        , "editat": smart.date(row.editat)
        , "editby": row.user.name.name_zh
      }));
    });

    // 格状表示
    var cols = []
      , container_grid = $("#material_grid")
      , tmpl_grid = $('#tmpl_material_grid').html()
      , colindex = 0;

    index = 1;
    _.each(_materialList, function(row){
      colindex = colindex >= 2 ? 0 : colindex;

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
      if (err) {
        Alertify.log.error("アップロード失敗しました。"); console.log(err);
      } else {
        render(_start, _count);
        Alertify.log.success("アップロードしました。");
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
        Alertify.log.error("ファイルを入れ替えに失敗しました。"); console.log(err);
      } else {

        render(_start, _count);
        renderDialog(result.data.items, index);
        Alertify.log.success("ファイルを入れ替えました。");
      }
    },
    function(progress){
      $("#upload_progress_bar").css("width", progress + "%");
    }
  );
}