$(function () {
  'use strict';

  var iconMap = {
    "1":"icon-volume-up",
    "2":"icon-calendar",
    "3":"icon-envelope",
    "4":"icon-group",
    "5":"icon-bar-chart",
    "6":"icon-pencil",
    "7":"icon-paste",
    "8":"icon-search",
    "9":"icon-briefcase",
    "10":"icon-bookmark",
    "11":"icon-book",
    "12":"icon-comments",
    "13":"icon-file-text-alt",
    "14":"icon-calendar-empty",
    "15":"icon-archive",
    "16":"icon-desktop",
    "17":"icon-microphone",
    "18":"icon-magic",
    "19":"icon-gear",
    "20":"icon-tags",
    "21":"icon-folder-open",
    "22":"icon-globe",
    "23":"icon-home",
    "24":"icon-download-alt",
    "25":"icon-bell",
    "26":"icon-check",
    "27":"icon-film",
    "28":"icon-cloud-upload",
    "29":"icon-edit",
    "30":"icon-camera"
  };

  var typeMap = {
    "ise" : "INSUITE",
    "sdb" : "SmartDB",
    "web" : "WEB",
    "app" : "APP"
  };

  $( "#sortable" ).sortable({
    revert: true
  });
  $( "#draggable" ).draggable({
    connectToSortable: "#sortable",
    helper: "clone",
    revert: "invalid"
  });
  //$( "ul, li" ).disableSelection();  ??
  var open_view = new userbox(smart.view("user1")).view
  open_view.initialize("textBoxTag", "", {search_target: "all"});

  render();

  events();

  function render(){
    var icon_tmpl = $( "#tmpl_icon").html();
    var iconContainer = $( "#icon_menu");
    // icon list menu
    if (iconContainer.html()) {
    } else {
      for(var i = 1; i < 31; i ++){
        iconContainer.append(_.template(icon_tmpl, {idx:i,icon:iconMap[i]}));
      }
    }

    $( "#sortable").html("");

    smart.doget("/workstation/list.json", function(err, result){
        if (err) {
          Alertify.log.error(i18n["js.common.list.empty"]); console.log(err);
        } else {
          var tmpl = $("#tmpl_sortable").html();
          _.each(result.items, function(item){

            $( "#sortable").append(_.template(tmpl, {
              icon: iconMap[item.icon],
              title: item.title,
              url: item.url,
              type: typeMap[item.type],
              sort: item.sort_level,
              wsid: item._id
            }));
          });
        }
    });

  }

  function events() {

    $('#setting_add').on('click', function () {

      setWSData({icon:1, type:"ise", open: 0});
      $("#settingModal").modal("show");
    });

    // list events
    $("#sortable").on("click", "a", function(event){
      var target = $(event.target);
      var operation = target.attr("operation")
        , wsid = target.attr("wsid");

      if (operation == "config") {

        smart.doget("/workstation/findOne.json?id="+wsid, function(err, result){
          if(smart.error(err,i18n["js.common.access.check"],false)){
            return;
          }

          if (result) {

            setWSData(result);
            $("#settingModal").modal("show");
          }
        });

      }
    });

    $("#sortable").on("click", "i", function(event){
        var target = $(event.target);
        var operation = target.attr("operation")
            , wsid= target.attr("wsid");

      if (operation == "delete") {

        Alertify.dialog.labels.ok = i18n["js.common.dialog.ok"];
        Alertify.dialog.labels.cancel = i18n["js.common.dialog.cancel"];
        Alertify.dialog.confirm(i18n["js.common.delete.confirm"], function () {

          smart.dodelete("/workstation/remove.json", {"id": wsid}, function(err, result){
            if (smart.error(err,i18n["js.common.save.error"],false)) {
              return;
            } else {
              render();
              Alertify.log.success(i18n["js.common.delete.success"]);
            }
          });
        }, function () {
          // Cancel
        });
      }
      return false;
    });

    $("#icon_menu").on("click", "i", function(event) {
        var target = $(event.target);
        var idx = target.attr("tabindex");

        $("#icon_select").removeClass();
        $("#icon_select").addClass(iconMap[idx]);
        $("#inputIcon").val(idx);
    });

    $('#saveWorkstation').on('click', function () {

      var ws = getWSData();

      smart.dopost("/workstation/update.json", ws, function(err, result){
        if (smart.error(err,i18n["js.common.save.error"],false)) {
            return;
        } else {
          $("#settingModal").modal("hide");
          render();
          Alertify.log.success(i18n["js.common.save.success"]);
        }
      });

    });

    $("#inputOpen").on("click", "button", function(event){
      var target = $(event.target);
      if (target.attr("value") == 1) {
        $("#textBoxTag").show();
      } else {
        $("#textBoxTag").hide();
      }
    });

    $("#saveList").on('click', function(){
      var wsList =  $("#sortable").find("li.ui-state-default");
      var sortList = [];
      var cnt = 1;

      _.each(wsList, function(ws){
        var wsid = ws.getAttribute("wsid");
        sortList.push(cnt + ":" + wsid)
        cnt++;
      });

      smart.dopost("/workstation/updateList.json", sortList, function(err, result){
        if (smart.error(err,i18n["js.common.save.error"],false)) {
          return;
        } else {
          //render();
          Alertify.log.success(i18n["js.common.save.success"]);
        }
      });

    });
  }

  function getWSData() {

    var ws = {
      "id":  $("#inputId").val(),
      "icon" : $("#inputIcon").val(),
      "title": $("#inputTitle").val(),
      "url"  : $("#inputUrl").val(),
      "type" : $("#inputType").attr('value'),
      "open" : $("#inputOpen").attr('value')
    };
    // opento
    if (ws.open) {
      var uids = [], gids = [];
      $("#textBoxTag ol li").each(function() {
        if ("user" == $(this).attr("type")) {
          uids.push($(this).attr("uid"));
        }
        if ("group" == $(this).attr("type")) {
          gids.push($(this).attr("uid"));
        }
      });
      ws.user = uids.join(",");
      ws.group= gids.join(",");
    }
    return ws;
  }

  function setWSData(ws) {
    $("#inputId").val(ws._id);

    $("#icon_select").removeClass();
    $("#icon_select").addClass(iconMap[ws.icon]);
    $("#inputIcon").val(ws.icon);

    $("#inputTitle").val(ws.title);
    $("#inputUrl").val(ws.url)

    new ButtonGroup("inputType", ws.type).init();

    // opento init start
    var defaultList= [];
    if (ws.to) {

      _.each(ws.to.user, function(row){
        if (row.valid == 1) {
          defaultList.push({
            uid : row._id,
            uname: row.name ? row.name.name_zh : "",
            type : "user"
          }) ;
        }
      });
      _.each(ws.to.group, function(row){
        if (row.valid == 1) {
          defaultList.push({
            uid : row._id,
            uname: row.name ? row.name.name_zh : "",
            type : "group"
          }) ;
        }
      });
    }
    open_view.setDefaults(defaultList);

    // init end

    var toggleOpento = function(val) {
      if (val == 1) {
        $("#textBoxTag").show();
      } else {
        $("#textBoxTag").hide();
      }
    }
    new ButtonGroup("inputOpen", ws.open, toggleOpento).init(toggleOpento);

  }

});