$(function () {
  'use strict';

  var iconMap = {
    "1":"/static/images/workstation/yim_icon_01.png",
    "2":"/static/images/workstation/yim_icon_02.png",
    "3":"/static/images/workstation/yim_icon_03.png",
    "4":"/static/images/workstation/yim_icon_04.png",
    "5":"/static/images/workstation/yim_icon_05.png",
    "6":"/static/images/workstation/yim_icon_06.png",
    "7":"/static/images/workstation/yim_icon_07.png",
    "8":"/static/images/workstation/yim_icon_08.png",
    "9":"/static/images/workstation/yim_icon_09.png",
    "10":"/static/images/workstation/yim_icon_10.png",
    "11":"/static/images/workstation/yim_icon_11.png",
    "12":"/static/images/workstation/yim_icon_12.png",
    "13":"/static/images/workstation/yim_icon_13.png",
    "14":"/static/images/workstation/yim_icon_14.png",
    "15":"/static/images/workstation/yim_icon_15.png",
    "16":"/static/images/workstation/yim_icon_16.png",
    "17":"/static/images/workstation/yim_icon_17.png",
    "18":"/static/images/workstation/yim_icon_18.png",
    "19":"/static/images/workstation/yim_icon_19.png",
    "20":"/static/images/workstation/yim_icon_20.png"
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
      for(var i = 1; i < 21; i ++){
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
            title: item.title || "　",
            url: item.url || "　",
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

    $("#icon_menu").on("click", "img", function(event) {
      var target = $(event.target);
      var idx = target.attr("tabindex");

      $("#icon_select").attr("src", iconMap[idx]);
      $("#inputIcon").val(idx);
    });

    $('#saveWorkstation').on('click', function () {

      var ws = getWSData();

      if (ws.title && ws.url) {
        smart.dopost("/workstation/update.json", ws, function(err, result){
          if (smart.error(err,i18n["js.common.save.error"],false)) {
            return;
          } else {
            $("#settingModal").modal("hide");
            render();
            Alertify.log.success(i18n["js.common.save.success"]);
          }
        });
      } else {
        Alertify.log.error(i18n["js.public.check.workstation.add"]);
      }
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
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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

    $("#icon_select").attr("src", iconMap[ws.icon]);
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