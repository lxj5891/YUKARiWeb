$(function () {
  'use strict';

//  // 上传
//  $("#img1024x768").bind("click", function(){
//
//    console.log("lalala");
//    //$("#uploadfile").trigger('click');
//  });
//  $("#uploadfile").bind("change", function(event){
//    uploadFiles(event.target.files);
//  });

});


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
