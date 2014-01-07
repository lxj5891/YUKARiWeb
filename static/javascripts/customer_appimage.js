$(function () {
  'use strict';

  // 上传
  $("#img_first").bind("click", function () {
    $("#uploadfile").trigger('click');
  });
  $("#uploadfile").bind("change", function (event) {
    uploadFiles(event.target.files, "image1");
  });

  $("#img_second").bind("click", function () {
    $("#uploadfile1").trigger('click');
  });
  $("#uploadfile1").bind("change", function (event) {
    uploadFiles(event.target.files, "image2");
  });

  $("#img_logo").bind("click", function () {
    $("#uploadfile2").trigger('click');
  });
  $("#uploadfile2").bind("change", function (event) {
    uploadFiles(event.target.files, "imagelogo");
  });
  event();
  render();
});
function event() {

  $("#image1").mouseover(function(e){
    $("#img_first").show();
  });
  $("#img_first").mouseover(function(e){
    $("#img_first").show();
  });
  $("#img_first").mouseout(function(e){
    $("#img_first").hide();
  });
  $("#imagelogo").mouseover(function(e){
    $("#img_logo").show();
  });
  $("#imagelogo").mouseout(function(e){
    $("#img_logo").hide();
  });
  $("#img_logo").mouseover(function(e){
    $("#img_logo").show();
  });
  $("#img_logo").mouseout(function(e){
    $("#img_logo").hide();
  });
  $("#image1").mouseout(function(e){
    $("#img_first").hide();
  });
  $("#image2").mouseover(function(e){
    $("#img_second").show();
  });
  $("#img_second").mouseover(function(e){
    $("#img_second").show();
  });
  $("#img_second").mouseout(function(e){
    $("#img_second").hide();
  });
  $("#image2").mouseout(function(e){
    $("#img_second").hide();
  });


  $("#saveimage").click(function (e) {
    var _image1 = $("#image1").attr("data") || null;
    var _image2 = $("#image2").attr("data") || null;
    var _imagelogo = $("#imagelogo").attr("data") || null;
    var _data = {
      image1: _image1,
      image2: _image2,
      logo: _imagelogo

    }
    smart.dopost("/setting/update/appimage.json", _data, function (err, result) {
      if(smart.error(err,i18n["js.common.update.error"],false)){
        return;
      }
      Alertify.log.success(i18n["js.common.update.success"]);
    });
  });
}

function render() {
  smart.doget("/setting/find/appimage.json", function (err, result) {
    if(smart.error(err,i18n["js.common.update.error"],true)){
      return;
    }

    for (var i in result) {
      $("#" + result[i].key).attr("data", result[i].val);
      if (result[i].val)
        $("#" + result[i].key).attr("src", "/picture/" + result[i].val);
    }
  })
};

function uploadFiles(files, el) {
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
  smart.dopostData("/file/upload.json", fd,
    function (err, result) {

      $("#upload_progress_dlg").modal("hide");
      if (smart.error(err, i18n["js.common.upload.error"], false)) {
        return;
      } else {

        $("#" + el).attr("src", "/picture/" + result.data[0]._id);
        $("#" + el).attr("data",result.data[0]._id);
        Alertify.log.success(i18n["js.common.upload.success"]);
      }
    },
    function (progress) {
      $("#upload_progress_bar").css("width", progress + "%");
    }
  );
}
