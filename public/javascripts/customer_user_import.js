$(function () {
  'use strict';
  $("#message").hide();
  events();
});


function events() {
  $("#importuser").bind("click", function(event){

    var files = $("#csvfile");
    if(files.length <= 0 || $(files[0]).val() == "")
      return;

    var fd = new FormData();
    for (var i = 0; i < files[0].files.length; i++) {
      fd.append("csvfile", files[0].files[i]);
      break;
    }
      smart.dopostData("/user/import/import.json",fd, function(err, result){
        if (err) {
          console.log(err);
          $("#message").css({'color': 'red'});
          $("#message").html(result.message);
          $("#message").show();
        } else {
            $("#message").css({'color': 'red'});
            $("#message").html(result.data.message);
            $("#message").show();
            $("#csvfile").val("");
        }
      });
    return false;
  });
}