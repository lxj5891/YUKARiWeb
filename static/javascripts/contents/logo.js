var LogoFace = function () {
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
  this.image = undefined;
  this.action = undefined;

  this.itemPreview = $("#action_bglogo_preview img");
  this.itemPanel = $("#solution_panel");
  this.itemTop = $("#solution_txt_y");
  this.itemLeft = $("#solution_txt_x");
  this.itemWidth = $("#solution_txt_width");
  this.itemHeight = $("#solution_txt_height");
  this.itemName = $("#solution_txt_widget_name");
  this.itemAction = $("#solution_action");
  this.template = $("#solution_tmpl_widget");
}

LogoFace.prototype.toObject = function () {
  var that = this;
  var _object = new Object();
  _object.name = that.name;
  _object.index = that.index;
  _object.action = that.action;
  _object.widget_id = that.logo_id;
  _object.width = that.width;
  _object.height = that.height;
  _object.top = that.top;
  _object.left = that.left;
  _object.metadata_id = that.metadata_id;
  return _object;
};


LogoFace.prototype.init = function () {
  this.self = $("#" + this.logo_id);
  this.action = this.action || {};
  this.action.tags =  this.action.tags || [];

  this.setDraggable();
  this.setResizable();
  this.setHover();
  this.setAction();
  this.setActionChange('init');
  this.setSelect();
};

LogoFace.prototype.create = function (_obj, load) {
  var that = this;
  that.name = _obj.name;
  that.index = _obj.index;
  that.material_id = _obj.material_id;
  that.metadata_id = _obj.metadata_id;
  that.width = _obj.width;
  that.height = _obj.height;
  that.top = _obj.top;
  that.left = load ? _obj.left : store.fixScaleWidthToIpad(_obj.left);
  that.action = _obj.action;
  if (_obj.action && _obj.action.material && _obj.action.material.fileid) {
    that.action.image = "/picture/" + _obj.action.material.fileid;
  }
  that.logo_id = _obj.logo_id ? _obj.logo_id : _obj.widget_id;

  // append div to panel
  console.log(_obj);
  $("#main_panel").append(_.template(
    $("#tmpl_logo").html(), {
      "id": that.logo_id,
      top: store.fixScaleHeightToWeb(that.top),
      left: store.fixScaleHeightToWeb(that.left),
      width: store.fixScaleHeightToWeb(that.width),
      height: store.fixScaleHeightToWeb(that.height)
    })
  );

  // add options
  this.self = $("#" + that.logo_id);
  this.border = $("#" + that.logo_id + "_border");

  if (that.action && that.action.image) {
    $("#" + that.logo_id + " img").attr("src", that.action.image);
  }

  // set style
  this.self.css("position", "absolute");
  this.self.css("background", "#A9A9AC");
//  this.self.css("opacity", "");
  return that;
};

// 拖拽
LogoFace.prototype.setDraggable = function () {

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
      store.setLogo(_this.metadata_id, _this);
    }
  });
}


LogoFace.prototype.setResizable = function () {

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

      if (store.fixScaleHeightToIpad(pos.top + _this.self.height()) > 723) {
        _this.self.height(store.fixScaleHeightToWeb(723) - pos.top);
      }
      store.setLogo(_this.metadata_id, _this);
    }
  });
};

LogoFace.prototype.setAction = function () {
  var _this = this;//删除插件事件


  $("#btn_remove_logo").unbind("click").bind("click", function () {
    $("#" + _this.logo_id).remove();
    store.removeLogo(_this.logo_id);
    $contents.view.logoList.hidLogoPanel();
  });
  $("#logo_tag_items").html('');
  for(var i in _this.action.tags){
    var _tag = _this.action.tags[i];
    $("#logo_tag_items").append(_.template($("#tmpl_logo_tag_item").html(),{
      tag : _tag.tag,
      subtag : _tag.subtag,
      num : i
    }));
  }

  $(".icon-remove").unbind("click").on("click",function(e){
    console.log($(e.target).attr("num"));
    var _i = parseInt($(e.target).attr("num"));
    _this.action.tags = _.without(_this.action.tags,_this.action.tags[_i]);
    _this.setAction();
  });
  $("#appendTag").unbind("click").bind("click",function(){
    if(!checkEmpty()){
      Alertify.log.error("请输入tag");
      return;
    }
    $("#logo_tag_items").append(_.template($("#tmpl_logo_tag_item").html(),{
      tag : '',
      subtag : '',
      num : _this.action.tags.length
    }));
    $(".text_tag").unbind("blur").bind("blur",function(){
      _this.action = _this.action ||{};
      _this.action.tags = []
      _this.action.tags = collectionTag();
    });
    $(".icon-remove").unbind("click").on("click",function(e){

      var _i = parseInt($(e.target).attr("num"));
      _this.action.tags = _.without(_this.action.tags,_this.action.tags[_i]);
      _this.setAction();

    });
  });



  if (_this.action) {

    if (_this.action.bg_material) {
      $("#action_bglogo_preview img").attr("src", "/picture/" + _this.action.bg_material.fileid);
    } else {
      if(_this.action.bg_image){
        $("#action_bglogo_preview img").attr("src", _this.action.bg_image);
      }else{
        $("#action_bglogo_preview img").attr("src", "/static/images/logo-block.png");
      }
    }
  } else {
    $("#action_bglogo_preview img").attr("src", "/static/images/logo-block.png");
  }


}

// 光标浮动
LogoFace.prototype.setHover = function () {

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


LogoFace.prototype.setActionChange = function (init) {
  var _this = this;
  var setImageAction = function () {

    $("#select_logo_image_btn").unbind("click").bind("click", function () {
      var selectedEvent = function (event) {
        if (event.material_id != undefined) {
          $("#" + _this.logo_id + " img").attr("src", event.image);
          _this.action = _this.action || {};
          _this.action.type = 'image';
          _this.action.material_id = event.material_id;
          _this.action.image = event.image;
          store.setLogo(store.cur_metadata_id, _this);
        }
      };
      var _popup = new ImagePopup({ type: 'single', tpl: 'image', el: 'pickThumbPic' }, selectedEvent);
      _popup.show();
    });

    $("#btnSelectLogoBgMetadata").unbind("click").bind("click", function () {
      var selectedEvent = function (event) {
        if (event.material_id != undefined) {
          $("#action_bglogo_preview img").attr("src", event.image);
          _this.action = _this.action || {};
          _this.action.type = 'image';
          _this.action.bg_material_id = event.material_id;
          _this.action.bg_image = event.image;
          store.setLogo(store.cur_metadata_id, _this);
        }
      };
      var _popup = new ImagePopup({ type: 'single', tpl: 'image', el: 'pickThumbPic' }, selectedEvent);
      _popup.show();
    });
  }

  setImageAction();


  $(".text_tag").unbind("blur").bind("blur",function(){
    _this.action = _this.action ||{};
    _this.action.tags = []
    _this.action.tags = collectionTag();
  });


}

function checkEmpty(){
  var flag = true;
  $("input[name=tag]").each(function(i,e){
    if($(e).val().length == 0){
      flag = false;
    }
  });
  $("input[name=subtag]").each(function(i,e){
    if($(e).val() == 0 ){
      flag = false;
    }
  });
  return flag;
}

function collectionTag(){
  var tag_list = [];
  $("input[name=tag]").each(function(i,e){
    tag_list[i] = tag_list[i] || {};
    tag_list[i].tag = $(e).val();

  });
  $("input[name=subtag]").each(function(i,e){
    tag_list[i] = tag_list[i] || {};
    tag_list[i].subtag = $(e).val();
  });
  return tag_list;
}

LogoFace.prototype.setSelect = function () {

  var _this = this;
  this.self.click(function () {
    //显示插件设定的form
    $contents.view.logoList.showlogoPanel();

    // remove old widget selection css
    if (store.activeLogo) {
      store.activeLogo.self.css("z-index", 1);
      store.activeLogo.border.removeClass("widget_border_selected");
    }

    // set selection css
    _this.self.css("z-index", 10);
    _this.border.addClass("widget_border_selected");

    // set active widget
    store.activeLogo = _this;
    store.cur_logo_id = _this.self.attr("id");

    _this.setAction();
    _this.setActionChange('init');
  });
};


