
$(function() {
  $('#container-demo').jrumble({
    x: 4,
    y: 0,
    rotation: 0
  });

  $("#loginform").keypress(function(e){
    if(e.keyCode == 13){
      login();
    }
  });
});

var demoTimeout;
function login() {

  var username = $('#name').val()
    , password = $('#pass').val()
    , path = $('#path').val()
    , csrftoken = $('#_csrf').val();

  if (client.browser.ie >=9 || client.browser.chrome !=0 || client.browser.safari !=0) {

  } else {
    Alertify.log.info("browser: chrome,safari,IE9,IE10");
    return;
  }

  // 必须输入，否则摇一摇
  if (username.length <= 0 || password.length <= 0) {

    var container = $('#container-demo');
    
    container.trigger('startRumble');
    clearTimeout(demoTimeout);
    demoTimeout = setTimeout(function(){container.trigger('stopRumble');}, 200);
  } else {

    $.ajax({
        url: "/simplelogin"
      , async: false
      , type: "GET"
      , data: {
        "path": path, "name": username, "pass": password, "home": "yukari"
      }
      , success: function(data, textStatus, jqXHR) {
        if (jqXHR.status != 200) {
          alert(data);
        } else {
          window.location = "/yukari";
        }
      }
      , error: function(jqXHR, textStatus, errorThrown) {
        Alertify.log.error(jqXHR.responseJSON.error.message);
      }
    });
  }
}

function applydata() {
    var btn = $('#btn-apply');
    var container = $('#container-apply');
    btn.hide();
    container.show();
}
