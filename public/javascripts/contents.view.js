var $contents = $contents || {};
$contents.view = $contents.view || {};
$contents.view.contentData = $contents.view.contentData || {};

$contents.view = {

  widgetList: undefined,

  initialize: function () {
    var that = this;
    that.initByStore(function () {
      that.viewDidLoad();
      that.listener();
      that.initCover(that.didListenerMaterialImagePanel);
      that.initMaterial(that.didListenerMaterialImagePanel);

    });

    console.log('$C  initialize ');
  },
  showEffectPage: function (metadata_id) {

    $("#widget_panel").css("display", "none");
    $("#metadata_panel").css("display", "block");
    $("#effect_big_preview").css("display", "none");
    var _metadata = store.getMetadata(metadata_id);
    $("#txt_metadata_effect option").each(function (e) {
      $(e).attr("selected", false);
    });
    $("#preview img").attr("src", "/images/block.png");
    $("#txt_metadata_effect").val("none");
    if (!_metadata.effect) {
      $("#txt_metadata_effect option:first").attr("selected", "selected");
      $("#txt_metadata_effect").val("none");
      $("#preview img").attr("src", "/images/block.png");
    } else {
//      $("#txt_metadata_effect option[value="+_metadata.effect+"]").attr("selected",true);
      $("#txt_metadata_effect").val(_metadata.effect);

      if (!_metadata.txtimage) {
        $("#preview img").attr("src", "/images/block.png");
      } else {
        $("#preview img").attr("src", _metadata.txtimage);
        $("#effect_big_preview img").attr("src", _metadata.txtimage);
        $("#effect_big_preview").css("display", "block");
      }
    }
    var textImageListener = function () {
      smart.doget("/material/list.json?type=image&&start=0&count=500", function (err, result) {
        if (smart.error(err, i18n["js.common.search.error"], false)) {
          return;
        }

        new jModal("pickThumbPic", tpl_materialPopupImage, result.items);
        $("#pickThumbPic").unbind('click').on("click", "img", function (e) {
          var $target = $($(e.target).parent().find('div'));
          $("#pickThumbPic div[checked]").removeClass("checked");
          $("#pickThumbPic div[checked]").removeAttr("checked");
          $target.toggleClass("checked");
          $target.attr("checked", true);

        });
        $("input[name=txt_tag]").unbind("change").bind("change", function (e) {
          console.log($(e.target).val());
        });
        $("button[name=okPickThumb]").unbind("click").bind("click", function (e) {
          var _src = $($("#pickThumbPic div[checked]").parent().find("img[class=material_thumb]")).attr("src");
          var _data = $($("#pickThumbPic div[checked]").parent().find("img[class=material_thumb]")).attr("data");
          var _material_id = $($("#pickThumbPic div[checked]").parent().find("img[class=material_thumb]")).attr("material_id");
          var _metadata = store.getMetadata(store.cur_metadata_id);
          var _metadata_index = store.getMetadataIndex(store.cur_metadata_id);
          _metadata.txtimage = _src;
          _metadata.txtmaterial_id = _material_id;

          _metadata.effect = $("#txt_metadata_effect").val();
          if (store.type == store._synthetic_type.imageWithThumb) {


          } else {

            if ($("#txt_metadata_effect").val() == "none") {
              Alertify.log.error(i18n["js.public.check.contents.view.effect"]);
              return;
            }

          }
          store.metadata[_metadata_index] = _metadata;
          var _cureffect = store.getCureffect();
          $("#preview img").attr("src", _cureffect.txtimage);
          $("#effect_big_preview").css("display", "block");
          $("#effect_big_preview img").attr("src", _cureffect.txtimage);
          //TODO : 判断封面类型
          $("#pickThumbPic").modal('hide');
        });
      });
      $("#pickThumbPic").modal('show');
    }
    $("#btn_select_effect_image").unbind("click").bind("click", textImageListener);
    var effectChangeListener = function (e) {
      var _effect = $("#txt_metadata_effect").val();
      var _metadata = store.getMetadata(store.cur_metadata_id);
      var _metadata_index = store.getMetadataIndex(store.cur_metadata_id);
      _metadata.effect = _effect;

      store.metadata[_metadata_index] = _metadata;
    };
    $("#txt_metadata_effect").unbind("change").bind("change", effectChangeListener);
    var removeEffectImage = function(e){
       console.log("removeEffectImage  ");
      var _metadata = store.getMetadata(store.cur_metadata_id);
      if(_metadata.txtmaterial_id){
        _metadata.txtmaterial_id = null;

      }
      if(_metadata.txtmaterial){
        _metadata.txtmaterial = null;
      }
      if(_metadata.txtimage){
        _metadata.txtimage = null;
      }
      store.setTxtmetadata(_metadata);

      $("#preview img").attr("src","/images/block.png");

    };
    $("#preview span").unbind("click").bind("click",removeEffectImage);
    var _metadata = store.getMetadata(store.cur_metadata_id);
    if(_metadata.txtmaterial_id){
      $("#preview span").css("display","block");
    }else{
      $("#preview span").css("display","none");
    }

  },
  /**
   * 已选择元素的 事件监听
   *
   *
   */
  didListenerCoverImagePanel: function () {
    var that = this;
    var self = $contents.view;
    var tags = '';
    $("input[name=txt_tag]").val('');
    var _coverClickListener = function () {
      var selectedEvent = function(event){
        if (event.material_id != undefined) {
          store.addCover(event.image, event.material_id);
          self.didRenderCover();
        }
      };
      var _popup = new ImagePopup({ type: 'single', tpl: 'image', el: 'pickThumbPic' }, selectedEvent);
      _popup.show();

    };
    $("#cover_panel  .cover_add").unbind("click").bind("click", _coverClickListener);

  },


  didListenerMaterialImagePanel: function () {
    var that = this;
    var self = $contents.view;
    var _coverMouseoverListener = function () {
//      store.stopCoverRunable();
    };
    $("#thumb_panel > .thumb img").unbind("mouseover").bind("mouseover", _coverMouseoverListener);
    var _coverMouseoutListener = function () {
//      store.startCoverRunable();
    };
    $("#thumb_panel > .thumb img").unbind("mouseout").bind("mouseout", _coverMouseoutListener);

    var _materialImageMouseoverListener = function (e) {
      var _target = $(e.target).parent().find("span")[0];
      var _target1 = $(e.target).parent().find("span")[1];
      var _target2 = $(e.target).parent().find("span")[2];
      $(_target).css("display", "block");
      $(_target).css("cursor", "pointer");
      $(_target1).css("display", "block");
      $(_target1).css("cursor", "pointer");
      $(_target2).css("display", "block");
      $(_target2).css("cursor", "pointer");
      //e005  移除图片
      var __removeMaterialImageEvent = function (e) {
        store.removeMetadata($(e.target).attr("metadata_id"));
        self.didRenderMaterialImagePanel(self.didListenerMaterialImagePanel);
      };
      $(_target).unbind("click").bind("click", __removeMaterialImageEvent);
      //levent001
      var __toLeftMaterialImageEvent = function (e) {
        var _intex = store.leftMetadata($(e.target).attr("metadata_id"));
        if (_intex == -1) {
          Alertify.log.error(i18n["js.public.check.contents.view.first"]);
          return;
        }
//        that.removePickThumb();
        self.didRenderMaterialImagePanel(self.didListenerMaterialImagePanel);
      };
      $(_target1).unbind("click").bind("click", __toLeftMaterialImageEvent);
      //revent002
      var __toRightMaterialImageEvent = function (e) {
        var _intex = store.rightMetadata($(e.target).attr("metadata_id"));
        if (_intex == -1) {
          Alertify.log.error(i18n["js.public.check.contents.view.last"]);
          return;
        }
        self.didRenderMaterialImagePanel(self.didListenerMaterialImagePanel);
      };
      $(_target2).unbind("click").bind("click", __toRightMaterialImageEvent);

    };
    $("#thumb_panel .material").unbind("mouseover").on("mouseover", "div[class=thumb_block]", _materialImageMouseoverListener);

    var _materialImageMouseoutListener = function (e) {
      var _target = $(e.target).parent().find("span")[0];
      var _target1 = $(e.target).parent().find("span")[1];
      var _target2 = $(e.target).parent().find("span")[2];
      $(_target).css("display", "none");
      $(_target1).css("display", "none");
      $(_target2).css("display", "none");
    }
    $("#thumb_panel .material").unbind("mouseout").on("mouseout", "div[class=thumb_block]", _materialImageMouseoutListener);
    //e004  图片点击
    /*
     * 点击选中图片的事件   会根据元素的类型判断不同的情况
     * store.type == store._synthetic_type.normal 会显示插件编辑窗口
     * store.type == store._synthetic_type.imageWithThumb 会显示效果bin'a
     *
     *
     **/
    var _materialImageClickListener = function (e) {
      var _data = $(e.target).attr("data");
      var _src = $(e.target).attr("src");
      var _metadata_id = $(e.target).attr("metadata_id");
      $("#main_panel > img").hide();
      $("#main_panel > img").attr("src", _src);
      $("#main_panel > img").fadeIn(800);
      store.cur_metadata_id = _metadata_id;
      if (store.type == store._synthetic_type.normal) {
        self.widgetList.showWidgetByPage(store.cur_metadata_id);
      }
//      self.widgetList.showWidgetByPage(store.cur_metadata_id);
      if (store.type == store._synthetic_type.imageWithThumb) {

        console.log("_materialImageClickListener");
        self.showEffectPage(store.cur_metadata_id);
      }
      if (store.type == store._synthetic_type.CaseView) {
        $("#cover_setting").css("display", "block");
        $("#main_panel").css("overflow-y", "scroll");
        $("#main_panel img").css("width", "100%");
        $("#main_panel img").css("height", "auto");
        $("#widget_panel").css("display", "none");
        $("#metadata_panel").css("display", "none");
      }

      //设置当前编辑的metadata_id


    };
    $("#thumb_panel .material").unbind("click").on("click", "img[class=thumb_block_img]", _materialImageClickListener);
    var tags = '';
    $("input[name=image_tag]").val('');
    var popuplistener = function () {
      var selectedEvent = function (event) {
        if (store.type == store._synthetic_type.CaseView) {

          $("#main_panel > img").attr("src", event.image);


          if (store.metadata && store.metadata.length == 1) {
            store.setMetadata(0,event);
          }else{
            var i = store.addMetadata(event.fileid, event.material_id);
          }
          self.didRenderMaterialImagePanel(self.didListenerMaterialImagePanel);
          return;
        }
        for(var i in event){
          var i = store.addMetadata(event[i].fileid, event[i].material_id);
          self.didRenderMaterialImagePanel(self.didListenerMaterialImagePanel);
          store.cur_metadata_id = "metadata_" + i;
        }

        if (store.type == store._synthetic_type.normal) {
          self.widgetList.showWidgetByPage(store.cur_metadata_id);
          $("#widget_panel").css("display", "block");
          $("#metadata_panel").css("display", "none");
        }
        if (store.type == store._synthetic_type.imageWithThumb) {
          self.showEffectPage(store.cur_metadata_id);
          $("#widget_panel").css("display", "none");
          $("#metadata_panel").css("display", "block");
        }
      };
      var options = undefined;
      if (store.type == store._synthetic_type.CaseView) {
        options = { type: 'single', tpl: 'image', el: 'pickThumbPic' };
      }else{
        options = { type: 'multiple', tpl: 'image', el: 'pickThumbPic' };
      }
      var _popup = new ImagePopup(options, selectedEvent);
      _popup.show();

    }

    $(".material_cell > .cover_add").unbind("click").bind('click', popuplistener);


  },

  /**
   * 渲染已选择元素的 预览
   *
   * @param listener 渲染后绑定事件监听器
   */
  initMaterial: function (listener) {
    this.didRenderMaterialImagePanel(listener, true);

  },
  didRenderMaterialImagePanel: function (listener, isInit) {
    var that = this;
    var args = arguments;

    var material_view = $("#thumb_panel > .material");
    // Init
    if (material_view.html().trim() == "") {
      material_view.html("<div class=\"material_cell\"> </div>");
      $(".material_cell").append(tpl_matedata_thumb_block());
    }

    // Append cell
    var material_cell = $(".material_cell")
    if (store.metadata.length > 0) {
      if (isInit) {
        for (var index in store.metadata) {
          var metadata = store.metadata[index];
          var params = { material_cell: material_cell, image: metadata.image, fileid: metadata.fileid, metadata_id: metadata.metadata_id };
          $contents.view.material.insertCell(params);
        }
      } else {
        var metadata = store.metadata[store.metadata.length - 1 ];
        var params = { material_cell: material_cell, image: metadata.image, fileid: metadata.fileid, metadata_id: metadata.metadata_id };
        $contents.view.material.insertCell(params);
      }
    } else {
      $contents.view.material.resetSize();
    }

    if ((typeof listener != "undefined") && _.isFunction(listener)) {
      listener.apply();
    }
  },
  initByStore: function (callback) {
    var that = this;
    var _data = {
      synthetic_id: $("input[name=synthetic_id]").val()
    };
    smart.dopost("/content/synthetic/getstore.json", _data, function (e, result) {
      if (result.data == '0') {
        callback.apply();
        return;
      }
      store.initSyntheticType(result.data.items.type);

      // 初始化Cover的行数列数
      var cover = $contents.view.cover;
      cover.intRowCol(result.data.items.coverrows, result.data.items.covercols);
      if (result.data.items.cover) {
        store.initCover(result.data.items.cover);
      } else {
        store.initCover([]);
      }
      if (result.data.items.metadata) {
        store.initMetadata(result.data.items.metadata);
      } else {
        store.initMetadata([]);
      }

      //TODO ：通过store  render
      var type_redner  = function(type){
        this._synthetic_type =  {imageWithThumb: "imageWithThumb", normal: 'normal', gallery: 'gallery', CaseView: "CaseView"};
        if(type == this._synthetic_type.imageWithThumb){
          return i18n["js.public.info.synthetic.type.animation"];
        } else if(type == this._synthetic_type.normal){
          return i18n["js.public.info.synthetic.type.imageset"];
        } else if(type == this._synthetic_type.gallery){
          return i18n["js.public.info.synthetic.type.gallery"];
        } else if(type == this._synthetic_type.CaseView){
          return i18n["js.public.info.synthetic.type.caseview"];
        }
        return
      }
      $("#syntheticName").val(result.data.items.name);
      $("#syntheticComment").val(result.data.items.comment);
      $("#syntheticType").html(type_redner(result.data.items.type));


      callback.apply();
    });

  },
  // 对应db的  类型
  _type: {thumb: 'thumb', cover: 'cover'},
  // 对应db的  类型 type
  _synthetic_type: {imageWithThumb: "imageWithThumb", normal: 'normal', gallery: 'gallery', CaseView: "CaseView"},
  //对应db 封面的类型
  _thumb_type: {image: 'image', video: 'video'},
//  removePickThumb: function () {
//    var that = this;
//    var self = $contents.view;
//    self.didRenderMaterialImagePanel(self.didCreateListener);
////    that.pickThumbFn();
//  },
  listener: function () {

    var that = this;


    $("#pickThumbPicClose").click(function(){
      $("#pickThumbPic").modal("hide");
    });
    /**
     * e0004
     * 保存元素的全部信息
     *
     *
     */
    $("div[name=okSaveSynthetic]").unbind("click").bind("click", function () {
      var synthetic_id = $("input[name=synthetic_id]").val();
      var _comment = $("#syntheticComment").val();
      var _name = $("#syntheticName").val();
      if (synthetic_id.length > 0) {
        console.log("synthetic_id  = %s", synthetic_id);
        if (_name.length == 0) {
          Alertify.log.error(i18n["js.public.check.contents.view.name"]);
          return;
        }
        if (store.cover.length == 0) {
          Alertify.log.error(i18n["js.public.check.contents.view.cover"]);
          //TODO: 选择封面  弹出画面
          return;
        }
        if (store.metadata.length == 0) {
          Alertify.log.error(i18n["js.public.check.contents.view.metadata"]);
          //TODO: 选择图片  画面
          return;
        }
        //保存插件信息
//        store.fixSaveWidget();
        var tmp_metadata = [];
        for (var i in store.metadata) {
          var obj_metadata = store.metadata[i];
          var tmp_metadata_widget = [];
          for (var j in obj_metadata.widget) {
            console.log(typeof obj_metadata.widget[j]);
            if (store.metadata[i].widget[j] instanceof WidgetFace)
              tmp_metadata_widget[j] = obj_metadata.widget[j].toObject();
            else
              tmp_metadata_widget[j] = obj_metadata.widget[j];
          }
          obj_metadata.widget = tmp_metadata_widget;
          tmp_metadata[i] = obj_metadata;
        }
        console.log();
        var _data = {
          synthetic_id: synthetic_id,
          coverrows: store.coverrows,
          covercols: store.covercols,
          cover: store.cover,
          metadata: tmp_metadata,
          syntheticName: $("input[name=syntheticName]").val(),
          syntheticComment: $("textarea[name=syntheticComment]").val()
        };

        var save_valida = store.validatorSava();
        console.log(save_valida);
        if (!save_valida.valide && store.type == store._synthetic_type.imageWithThumb) {
          Alertify.log.error(save_valida.err);
        } else {
          smart.dopost("/content/synthetic/saveAll.json", _data, function (e, result) {
            Alertify.log.success(i18n["js.common.save.success"]);
            window.location.href = "/content/synthetic/edit/" + result.data.items._id;
          });
        }
      }
    });


    var _panel_swich = function (e) {

      var _metadata = store.getMetadata(store.cur_metadata_id);
      if (_metadata.effect) {
        Alertify.log.error(i18n["js.public.info.contents.view.effect"]);
        return;
      }
      ;
      $("#widget_panel").css("display", "block");
      $("#metadata_panel").css("display", "none");

    };
    $("#btn_to_widget").unbind("click").bind("click", _panel_swich);
    /*
     * 事件编号 e0001
     * 保存详细信息方法
     * _data :{synthetic_id:元素的id ， comment： 元素的详细介绍  ，元素的名称}
     * 必须通过这里指定元素名称才能保存元素
     */
    $("button[name=okSaveDescription]").unbind("click").bind("click", function () {
      var _synthetic_id = $("input[name=synthetic_id]").val();
      var _comment = $("#syntheticComment").val();
      var _name = $("#syntheticName").val();

      var _data = {
        synthetic_id: _synthetic_id,
        comment: _comment,
        name: _name
      };
      smart.dopost("/content/synthetic/saveDescription.json", _data, function (e, result) {
        Alertify.log.success(i18n["js.common.save.success"]);
        $("#savemodal").modal('hide');
      });
    });
    /*
     * 事件编号 e0002
     * 保存元素的基本信息
     * _data :{_name:元素的名称 ， ， comment： 元素的详细介绍  ，元素的名称}
     */
    $("button[name=okSetting]").on("click", function (e) {
      var _name = $("input[name=name]").val();
      var _type = $("select[name=type]").val();
      var _thumb_type = $("input[name=thumb_type]:checked").val();

      var _data = {
        name: _name,
        type: _type,
        thumb_type: _thumb_type
      };

      smart.dopost("/content/synthetic/save.json", _data, function (e, result) {
        that.didCreateCallback(result);
      });
    });
    /*
     * 事件编号 e0003
     * 取消编辑元素的详细信息
     */
    $("button[name=cancelSaveDescription]").unbind("click").bind("click", function () {
      $("#savemodal").modal('hide');
      Alertify.log.info(i18n["js.public.info.contents.view.cancel"]);
    });


  },
  widget_status: 'view',
  initWidget: function () {
    var $widget = $contents.view.widget;
    $widget.addWidget();
  },
  initWidgetListener: function () {
//    var that = this;
//    var $widget = $contents.view.widget;
//    if (that.widget_status == 'view') {
//      $("#widget_panel .widget_body ul").css("display", "none");
//      $("#widget_panel .widget_body form").css("display", "block");
//      that.widget_status = 'edit';
//    } else {
//      $("#widget_panel .widget_body ul").css("display", "block");
//      $("#widget_panel .widget_body form").css("display", "none");
//      that.widget_status = 'view';
//    }
  },
  initWidgetEventListener: function () {
//    var that = this;
//    $("#widget_panel ul").on("mouseout","li",function(e){
//      $(e.target).css("background","#ffffff");
//    });
//    //e002  插件一览
//    $("#widget_panel ul").unbind("mouseover").on("mouseover","li",function(e){
//      console.log(e.currentTarget);
//      $(e.currentTarget).css("background","#fff333");
//    });
//    //e003  点击插件
//    $("#widget_panel ul").on("click","li",function(e){
//      var _data = $(e.target).attr("data");
//      console.log(_data);
//      if(_data){
//        console.log("编辑插件");
//        that.editWidgetSwichView(_data);
//      }
//    });
  },
//  editWidgetSwichView: function (data) {
//    var that = this;
//    $("#widget_panel .widget_body ul").css("display", "none");
//    $("#widget_panel .widget_body form").css("display", "block");
//    that.widget_status = 'edit';
//    var w = store.getWidget(store.cur_content_id,data);
//    $("input[name=widget_name]").val(w.name);
//    $("input[name=widget_left]").val(w.left);
//    $("input[name=widget_top]").val(w.top);
//    $("input[name=widget_width]").val(w.width);
//    $("input[name=widget_height]").val(w.height);
//    $("input[name=widget_id]").val(w.id);
//    console.log(w);
//  },

  didCreateCallback: function (data, listener) {

    var that = this;
    //TODO:合理渲染封面图片
    that.didRenderCover();
    var _data = data.data.items;
    //根据返回的类型定义封面

    console.log(_data);
    $("input[name=synthetic_id]").val(_data._id);

    //TODO ：根据返回的类型定义画面

    //关闭modal


    $("#settingModal").modal('hide');

    listener.apply();
  },


  viewDidLoad: function () {
    if (store.type == store._synthetic_type.imageWithThumb) {
      $("#btn_to_widget_parent").css("display", "none");
    }
    $("#widget_panel").css("display", "none");
    $("#metadata_panel").css("display", "none");
    $("#_action_type_image").css("display", "none");
    $("#_action_type_movie").css("display", "none");
    $("#_action_type_jump").css("display", "none");
    $("#_action_type_urlScheme").css("display", "none");

    $("#viewport").append("<div id=\"thumb_panel\"></div>");
    $("#thumb_panel").append("<div class=\"material\"></div></div>");
    if (store.type == store._synthetic_type.CaseView) {
      $("#widget_panel").css("display", "none");
      $("#metadata_panel").css("display", "none");
    }
  },
  initCover: function (listener) {
    this.didRenderCover(listener, true);
  },
  didRenderCover: function (listener, isInit) {
    var that = this;
    //TODO :根据类型判断
    var cover_view = $("#cover_panel > .cover_view");
    var cover_cell;
    // Init cover cell
    if (cover_view.html().trim() == "") {
      cover_view.html("<div class=\"cover_cell\"> </div>");
      cover_cell = $(".cover_cell");
      cover_cell.append(tpl_matedata_thumb_block());
    }

    // Append cell
    if (store.cover.length > 0) {
      if (isInit) {
        for (var index in store.cover) {
          var thumb = store.cover[index];
          if (index == 0)
            $("#thumb_panel .thumb img").attr("src", thumb.image);

          var params = { cover_cell: $(".cover_cell"), image: thumb.image, fileid: thumb.fileid };
          $contents.view.cover.insertCell(params);
        }
      } else {
        var thumb = store.cover[store.cover.length - 1 ];
        var params = { cover_cell: $(".cover_cell"), image: thumb.image, fileid: thumb.fileid };
        $contents.view.cover.insertCell(params);
        $("#thumb_panel .thumb img").attr("src", thumb.image);
      }
    }

    // Reset all cell size
    if ($contents.view.cover)
      $contents.view.cover.resetCoverViewSize();

    that.didListenerCoverImagePanel();
//    if ((typeof listener != "undefined") && _.isFunction(listener)) {
//      listener.apply();
//    }
  },

  render_pickImg: function (type) {
    var that = this;
    if (that._type.thumb == type) {
    } else if (that._type.cover == type) {
    }
    $("#pickImg").modal("show");
  }

}
;


$(document).ready(function () {
  $contents.view.initialize();
});
