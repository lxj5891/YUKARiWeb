$(function () {
  'use strict';
// 添加插件

  $contents.view.logoList = {

    initLogolistFromMetadata: function (metadata) {
      var that = this;

      _.each(metadata, function (e, i) {
        var _logo = e.widget;
        store.cleanWidget(e.metadata_id);
        for (var _i in _logo) {
          var data = _logo[_i];
          var _obj = new LogoFace();

          var create_obj = _obj.create(data, 1);
          create_obj.init();
          store.addLogo(e.metadata_id, create_obj);
        }

      });
      that.showLogoPage(undefined);

    },
    hidLogoPanel : function(){
      $("#logo_panel form").css("display","none");
    },
    showlogoPanel: function () {
      $("#logo_panel form").css("display", "block");
    },
    showLogoPage : function(metadata_id){

      $("#logo_panel").css("display","block");
      $("#widget_panel").css("display","none");
      $("#metadata_panel").css("display","none");
      //隐藏全部的widget
      var that = this;
      var count = store.hideAllWidget();
      console.log("隐藏了" + count + "个widget");
      that.hidLogoPanel();
      //显示当前metadata  的widget
      if (!metadata_id) {
        return;
      }
      var _metadata = store.getMetadata(metadata_id);
      if(_metadata && _metadata.logo){
        var _logo = _metadata.logo;
        _.each(_logo, function (logo) {
          $("#" + logo.logo_id).css("display", "block");
        });
      }
    }

  }

  $("#btn_add_logo").bind("click", function (event) {
    if (store.cur_metadata_id.length == 0) {
      Alertify.log.error(i18n["js.public.check.widget.length"]);
      return;
    }
    var _obj = new LogoFace();
    var logo_obj = {
      title: undefined,
      name: i18n["js.public.info.widget.name"] + store.logo_index,
      index: store.logo_index,
      logo_id: "logo" + store.logo_index,
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      background: undefined,
      effect: undefined,
      action: undefined,
      metadata_id: store.cur_metadata_id,
      page: store.cur_metadata_id
    };
    var create_obj = _obj.create(logo_obj);
    create_obj.init();
    store.addLogo(store.cur_metadata_id, create_obj);

    return false;
  });

  if (store.type == store._synthetic_type.Introduction) {
    $contents.view.logoList.initLogolistFromMetadata(store.metadata);


  }
});

