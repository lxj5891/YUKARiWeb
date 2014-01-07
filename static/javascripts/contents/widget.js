
var WidgetFace = function () {
  this.name = undefined;
  this.index = undefined;
  this.widget_id = undefined;
  this.width = undefined;
  this.height = undefined;
  this.top = undefined;
  this.left = undefined;
  this.background = undefined;
  this.effect = undefined;
  this.action = undefined;
  this.metadata_id = undefined;
  this.page = undefined;
  this.self = undefined;
  this.material_id = undefined;

  this.itemPanel = $("#main_panel");
  this.itemTop = $("#txt_y");
  this.itemLeft = $("#txt_x");
  this.itemWidth = $("#txt_width");
  this.itemHeight = $("#txt_height");
  this.itemName = $("#txt_widget_name");
  this.itemAction = $("#action");
  this.itemAnimation = $("#animation");
  this.itemJumpValue = $("#txt_action_type_jump");
  this.template = $("#tmpl_widget");
}
WidgetFace.prototype.toObject = function() {
  var that = this;
  var _object =  new Object();
  _object.name = that.name;
  _object.name= that.name;
  _object.index= that.index;
  _object.widget_id = that.widget_id;
  _object.width = that.width;
  _object.height = that.height;
  _object.top = that.top;
  _object.left = that.left;
  _object.action = that.action;
  _object.metadata_id = that.metadata_id;
  _object.page = that.page;
  _object.material_id = that.material_id;
  return _object;
};

WidgetFace.prototype.init = function() {
  $("#_action_type_image").css("display", "none");
  $("#_action_type_movie").css("display", "none");
  $("#_action_type_jump").css("display", "none");
  $("#_action_type_urlScheme").css("display", "none");

  this.self = $("#"+this.widget_id);


  this.setSelect();
  this.setHover();
  this.setResizable();
  this.setDraggable();
  this.setAction();
  this.setActionChange();
};
WidgetFace.prototype.create = function(_obj){
  var that =this;
  that.name = _obj.name;
  that.index = _obj.index;
  that.widget_id = _obj.widget_id;
  that.width = _obj.width;
  that.height = _obj.height;
  that.top = _obj.top;
  that.left = _obj.left;
  that.action = _obj.action;
  that.metadata_id = _obj.metadata_id;
  // append div to panel

  $("#main_panel").append(_.template(
    $("#tmpl_widget").html(), {
      "id": that.widget_id, top: store.fixScaleHeightToWeb(that.top), left: store.fixScaleHeightToWeb(that.left), width: store.fixScaleHeightToWeb(that.width), height: store.fixScaleHeightToWeb(that.height)
    })
  );

  // add options
  this.self = $("#" + that.widget_id);
  this.border = $("#" + that.widget_id + "_border");

  // set style
  this.self.css("position", "absolute");
  this.self.css("background", "#A9A9AC");
  this.self.css("opacity", "0.4");
  return that;
};

WidgetFace.prototype.setResizable = function () {

  var _this = this;
  this.self.resizable({
    start: function () {
    },
    resize: function () {
      var pos = _this.self.position();

      if (store.fixScaleWidthToIpad(pos.left + _this.self.width()) > 1024) {
        _this.self.width(store.fixScaleWidthToWeb(1024) - pos.left);
        return false;
      }
      if (store.fixScaleHeightToIpad(pos.top + _this.self.height()) > 723) {
        _this.self.height(store.fixScaleHeightToWeb(723) - pos.top);
        return false;
      }
      _this.itemWidth.val(parseInt(store.fixScaleWidthToIpad(_this.self.width())));
      _this.itemHeight.val(parseInt(store.fixScaleHeightToIpad(_this.self.height())));

    },
    stop: function () {
      var pos = _this.self.position();
      _this.itemWidth.val(parseInt(store.fixScaleWidthToIpad(_this.self.width())));
      _this.itemHeight.val(parseInt(store.fixScaleHeightToIpad(_this.self.height())));
      _this.width = store.fixScaleWidthToIpad(_this.self.width());
      _this.height = store.fixScaleHeightToIpad(_this.self.height());
      if (store.fixScaleWidthToIpad(pos.left + _this.self.width()) > 1024) {
        _this.self.width(store.fixScaleWidthToWeb(1024) - pos.left);
      }
      console.log(pos.top + _this.self.height());
      if (store.fixScaleHeightToIpad(pos.top + _this.self.height()) > 723) {
        _this.self.height(store.fixScaleHeightToWeb(723) - pos.top);
      }
      store.setWidget(_this.metadata_id,_this);
    }
  });
};

/*
* 绑定插件插件动作的变化的方法
*
* */
WidgetFace.prototype.setActionChange = function(init){
  var _this = this;



  var setImageAction = function() {
    if(_this.action&&(_this.action.type!=store._action_type.image))
    _this.action = undefined;
//    var _loadMaterialFn = function(start){
//      smart.doget("/material/list.json?type=image&&start=0&count=500", function (err, result) {
//        if (smart.error(err, i18n["js.common.search.error"], false)) {
//          return;
//        }
//
//        new loadModal("pickThumbPic", tpl_materialPopupImage, result.items,'single',function(event){
//          $(".action_widget_image_preview img").attr("src",event.src);
//          _this.action = {};
//          _this.action.type= store._action_type.image;
//          _this.action.material_id = event.material_id;
//          _this.action.image = event.src;
//        });
//      });
//      //_loadMaterialFn 的callback  启动显示窗口
//      start();
//    };
    var _fn = function(){
      var selectedEvent = function(event){
        if (event.material_id != undefined) {
          $(".action_widget_image_preview img").attr("src",event.image);
          _this.action = {};
          _this.action.type= store._action_type.image;
          _this.action.material_id = event.material_id;
          _this.action.image = event.image;
        }
      };
      var _popup = new ImagePopup({ type: 'single', tpl: 'image', el: 'pickThumbPic' }, selectedEvent);
      _popup.show();
    };
    $("a[name=btnSelectWidgetImage]").unbind("click").bind("click",_fn);
  };
  var setJumpAction = function(){
    if(_this.action&&(_this.action.type!=store._action_type.jump))
      _this.action = undefined;
    var _metadata = [];
    for(var i in store.metadata){
      var m = store.metadata[i].material;
      _metadata[i] = {
        image : store.metadata[i].image,
        data :store.metadata[i].index,
        metadata_id :store.metadata[i].metadata_id
      }
    }
    new jModal("pickThumbPic", tpl_materialPopupImage,_metadata);
    $("#pickThumbPic").unbind('click').on("click", "img", function (e) {
      var $target = $($(e.target).parent().find('div'));
      $("#pickThumbPic div[checked]").removeClass("checked");
      $("#pickThumbPic div[checked]").removeAttr("checked");
      $target.toggleClass("checked");
      $target.attr("checked", true);

    });
    $("button[name=okPickThumb]").unbind("click").bind("click", function (e) {
      var _src = $($("#pickThumbPic div[checked]").parent().find("img[class=material_thumb]")).attr("src");
//        var _data = $($("#pickThumbPic div[checked]").parent().find("img[class=material_thumb]")).attr("data");
      var _metadata_id = $($("#pickThumbPic div[checked]").parent().find("img[class=material_thumb]")).attr("metadata_id");
      //存储画像表示类型的图片
      //value存入数据库
      var _data = store.getMetadata(_metadata_id);
      console.log(_data);
      _this.action = {};
      _this.action.type= store._action_type.jump;
      _this.action.value = _data.index;
      //image用于画面存入数据库
      _this.action.image = _src;
      //渲染画像表示类型的图片
      $(".action_jump_preview img").attr("src",_src);
      $("#pickThumbPic").modal('hide');
    });
    $("#pickThumbPic").modal('show');
  };
  var setMovieAction = function(){
    if(_this.action&&(_this.action.type!=store._action_type.movie))
      _this.action = undefined;

    var _loadMaterialFn = function(start){
      smart.doget("/material/list.json?start=0&count=500&&contentType=video", function (err, result) {
        if (smart.error(err, i18n["js.common.search.error"], false)) {
          return;
        }
        new loadModal("pickThumbPic", tpl_materialPopupVideo, result.items,'video',function(event){
          $(".action_widget_moive_preview video").attr("src",event.src);
//          _this.action = _this.action ||{};
          _this.action = {};
          _this.action.type= store._action_type.movie;
          _this.action.material_id = event.material_id;
          console.log(event);
        });
      });
      //_loadMaterialFn 的callback  启动显示窗口
      start();
    };

    var _fn = function(){
      var selectedEvent = function(event){
        if (event.material_id != undefined) {
          $(".action_widget_moive_preview video").attr("src",event.image);
//          _this.action = _this.action ||{};
          _this.action = {};
          _this.action.type= store._action_type.movie;
          _this.action.material_id = event.material_id;
        }
      };
      var _popup = new ImagePopup({ type: 'video', tpl: 'image', el: 'pickThumbPic' }, selectedEvent);
      _popup.show();
    }

    $("a[name=btnSelectWidgetMoive]").unbind("click").bind("click",_fn);
  };
  var setUrlSchemeAction = function(){
    if(_this.action&&(_this.action.type!=store._action_type.urlScheme))
      _this.action = undefined;

    $("#txt_widget_action_app").unbind("change").bind("change",function(e){
      _this.action = _this.action ||{};
      _this.action.type= store._action_type.urlScheme;
      _this.action.urlScheme = $(e.target).val();
    });
    $("#txt_widget_action_url").unbind("change").bind("change",function(e){
      _this.action = _this.action ||{};
      _this.action.type= store._action_type.urlScheme;
      _this.action.downloadURL = $(e.target).val();
    });
  };
  var setNoneAction = function(){

  };
  var _action_chage_event = function(){
    var cur_action_type = $("#action").val();
    if(!_this.action||cur_action_type != _this.action.type ){
      $(".action_widget_moive_preview video").attr("src",'/static/images/logo-block.png');
      $(".action_widget_image_preview img").attr("src",'/static/images/logo-block.png');
      $(".action_jump_preview img").attr("src","/static/images/logo-block.png");
      $("#txt_widget_action_app").val('');
      $("#txt_widget_action_url").val('');

    }

//    _this.action = _this.action ||{};
//    _this.action.type= cur_action_type;
    $("#_action_type_image").css("display", "none");
    $("#_action_type_movie").css("display", "none");
    $("#_action_type_jump").css("display", "none");
    $("#_action_type_urlScheme").css("display", "none");
    if (cur_action_type == store._action_type.image) {
      $("#_action_type_image").css("display", "block");
      //设置画像表示的动作设置画面
      setImageAction();
    } else if (cur_action_type == store._action_type.movie) {
      setMovieAction();
      $("#_action_type_movie").css("display", "block");
    } else if (cur_action_type == store._action_type.jump) {
      $("#_action_type_jump").css("display", "block");
//      setJumpAction();
      $("a[name=btnSelectWidgetMetadata]").unbind("click").bind("click",setJumpAction);
    } else if (cur_action_type == store._action_type.urlScheme) {
      $("#_action_type_urlScheme").css("display", "block");
      setUrlSchemeAction();
    } else if (cur_action_type == store._action_type.none){

    }
  };


  $("#action").unbind("change").bind("change", _action_chage_event);
  //初始化action的全部事件
  if(init&&_this.action){
    _action_chage_event()
  }
};
/*
* 初始化插件动作的方法
*
* */
WidgetFace.prototype.setAction = function(){
  var _this = this;
  if(!_this.action){
    //如果不存在动作设置为none
    _this.itemAction.val("none");
  }else{

    _this.itemAction.val(_this.action.type);
  }
//  $(".action_jump_preview img").attr("src","/static/images/logo-block.png");
//  $(".action_widget_image_preview video").attr("src",'/static/images/logo-block.png');
//  $(".action_jump_preview img").attr("src",'/static/images/logo-block.png');


  //删除插件事件
  $("a[name=okDelWidget]").unbind("click").bind("click",function(){
    $("#" + _this.widget_id).remove();
    store.removeWidget(_this.metadata_id,_this.widget_id);
  });
  $("#_action_type_image").css("display", "none");
  $("#_action_type_movie").css("display", "none");
  $("#_action_type_jump").css("display", "none");
  $("#_action_type_urlScheme").css("display", "none");
  //初始化插件
  if(_this.action){
    if (_this.action.type == store._action_type.jump) {
      var _data = store.getMetadata("metadata_"+_this.action.value);
      _this.action.value = _data.index;
      //image用于画面存入数据库
      _this.action.image = _data.image;
      //渲染画像表示类型的图片
      $(".action_jump_preview img").attr("src",_this.action.image);
      $("#_action_type_jump").css("display", "block");
    }else if(_this.action.type == store._action_type.image){
      if(_this.action.material){
        $(".action_widget_image_preview img").attr("src",'/picture/'+_this.action.material.fileid);
      }else{
        $(".action_widget_image_preview img").attr("src",_this.action.image);
      }
      $("#_action_type_image").css("display", "block");
    }else if(_this.action.type == store._action_type.movie){
      if(_this.action){
        if(_this.action.material){
          $(".action_widget_image_preview video").attr("src",'/picture/'+_this.action.material.fileid);
        }
      }
      $("#_action_type_movie").css("display", "block");
    }else if(_this.action.type == store._action_type.urlScheme){
      $("#_action_type_urlScheme").css("display", "block");
      $("#txt_widget_action_app").val(_this.action.urlScheme);
      $("#txt_widget_action_url").val(_this.action.downloadURL);
    }
  }
};

// 拖拽
WidgetFace.prototype.setDraggable = function () {

  var _this = this;
  this.self.draggable({ containment: "parent",
    start: function () {
    },
    drag: function () {
      var pos = _this.self.position();

      _this.itemLeft.val(parseInt(store.fixScaleWidthToIpad(pos.left)));
      _this.itemTop.val(parseInt(store.fixScaleHeightToIpad(pos.top)));
    },
    stop: function () {
      var pos = _this.self.position();
      _this.itemLeft.val(parseInt(store.fixScaleWidthToIpad(pos.left)));
      _this.itemTop.val(parseInt(store.fixScaleHeightToIpad(pos.top)));
      _this.left = store.fixScaleWidthToIpad(pos.left);
      _this.top = store.fixScaleHeightToIpad(pos.top);
      store.setWidget(_this.metadata_id,_this);
    }
  });
}


  // 光标浮动
WidgetFace.prototype.setHover =  function () {

  var _this = this;
  this.self.hover(
    function () { // active
      _this.border.addClass("widget_border_hover");
    },
    function () { // de active
      _this.border.removeClass("widget_border_hover");
    }
  );
}

WidgetFace.prototype.setSelect =  function () {

  var _this = this;
  this.self.click(function () {
    $("#action").unbind("change");
    //显示插件设定的form
    $contents.view.widgetList.showWidgetPanel();

    // remove old widget selection css
    if (store.activeWidget) {
      store.activeWidget.self.css("z-index", 1);
      store.activeWidget.border.removeClass("widget_border_selected");
    }

    _this.itemLeft.val(parseInt(store.fixScaleWidthToIpad(_this.self.position().left)));
    _this.itemTop.val(parseInt(store.fixScaleHeightToIpad(_this.self.position().top)));
    _this.itemWidth.val(parseInt(store.fixScaleWidthToIpad(_this.self.width())));
    _this.itemHeight.val(parseInt(store.fixScaleHeightToIpad(_this.self.height())));
    _this.itemName.val(_this.name);


    // set selection css
    _this.self.css("z-index", 10);
    _this.border.addClass("widget_border_selected");

    // set active widget
    store.activeWidget = _this;
    store.cur_widget_id = _this.self.attr("id");

    _this.setAction();
    _this.setActionChange('init');
  });
}