$(function () {
  'use strict';

  /**
   * 所有widget一览
   */
  var widgetList = {

    widgets: [], activeWidget: undefined, unique: 0,

    initWidgetlistFromMetadata: function (metadata) {
      var that = this;

      _.each(metadata, function (e, i) {
        var _widget = e.widget;
        store.cleanWidget(e.metadata_id);
        for (var _i in _widget) {
          var data = _widget[_i];
          var _obj = new WidgetFace();
          var create_obj = _obj.create(data);
          create_obj.init();
          store.addWidget(e.metadata_id, create_obj,_i);
        }

      });
      that.showWidgetByPage(undefined);
    }
    // 获取指定页的widget
    , getWidgetsByPage: function (page) {
      return _.find(this.widgets, function (widget) {
        return widget.page == page;
      });
    }

    // 显示指定的页面的widget
    ,
    hideWidgetPanel :function(){
      $("#widget_panel form").css("display","none");
    },
    showWidgetPanel :function(){
      $("#widget_panel form").css("display","block");
    },
    showWidgetByPage: function (metadata_id) {

      $("#widget_panel").css("display","block");
      $("#metadata_panel").css("display","none");
      //隐藏全部的widget
      var that = this;
      var count = store.hideAllWidget();
      console.log("隐藏了" + count + "个widget");
      that.hideWidgetPanel();
      //显示当前metadata  的widget
      if (!metadata_id) {
        return;
      }
      var _metadata = store.getMetadata(metadata_id);
      if(_metadata && _metadata.widget){
        var _widget = _metadata.widget;
        _.each(_widget, function (widget) {
          $("#" + widget.widget_id).css("display", "block");
        });
      }
    }

    // 从列表删除
    , removeWidget: function (metadata_id,widget_id) {
      var _metadata = this.getMetadata(metadata_id);
      for(var i in _metadata.widget){
        if(_metadata.widget[i].widget_id == widget_id){
          _metadata.widget = _.without(_metadata.widget, _metadata.widget[i]);
          $("#"+widget_id).remove();
        }
      }

    }

    // 添加到列表
    , addWidget: function (widget) {
      this.widgets.push(widget);
      this.unique++;
      return widget;
    }

  };

  /**
   * widget对象
   * @param list
   * @constructor
   */
  var WidgetObject = function (list) {

    this.widget = {
      title: undefined, width: undefined, height: undefined, top: undefined, left: undefined, effect: undefined, action: undefined, widget_id: undefined, self: undefined       // Widget jQuery Object
      , page: undefined       //
      , list: undefined       // 所有Widget一览
      , border: undefined     // Widget 边框对象
      , background: undefined // Widget 背景
      , template: undefined   // Widget 模板

      , itemPanel: undefined, itemWidth: undefined, itemHeight: undefined, itemLeft: undefined, itemTop: undefined, itemName: undefined, itemAnimation: undefined, itemAction: undefined, itemJumpValue: undefined

      // 对象初始化
      , init: function () {
        $("#_action_type_image").css("display", "none");
        $("#_action_type_movie").css("display", "none");
        $("#_action_type_jump").css("display", "none");
        $("#_action_type_urlScheme").css("display", "none");
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
        this.list = list;
        return this;
      }, fixWidgetStore: function () {
        var that = this;
        that.title = that.self.attr("id")
        that.widget_id = that.self.attr("id");
        that.width = $("#" + that.widget_id).width();
        that.height = $("#" + that.widget_id).height();
        that.top = parseInt($("#" + that.widget_id).css("top").split('px')[0]);
        that.left = parseInt($("#" + that.widget_id).css("left").split('px')[0]);
        that.effect = $("#" + that.widget_id).attr("effect") || 0;
        that.action = $("#" + that.widget_id).attr("action") || 0;
      }
      // 新建
      , add: function (page, data) {

        this.list.addWidget(this);

        // default value
        data = data || {id: "widget" + this.list.unique, top: 10, left: 10, width: 150, height: 150};

        // append div to panel
        this.itemPanel.append(_.template(
          this.template.html(), {
            "id": data.id, top: data.top, left: data.left, width: data.width, height: data.height
          })
        );

        // add options
        this.self = $("#" + data.id);
        this.border = $("#" + data.id + "_border");
        this.page = page;

        // set style
        this.self.css("position", "absolute");
        this.self.css("background", "#A9A9AC");
        this.self.css("opacity", "0.4");

        // set event
        this.setSelect();
        this.setHover();
        this.setResizable();
        this.setDraggable();
      }

      // 调整大小
      , setResizable: function () {

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
            _this.itemWidth.val(store.fixScaleWidthToIpad(_this.self.width()));
            _this.itemHeight.val(store.fixScaleHeightToIpad(_this.self.height()));

          },
          stop: function () {
            _this.itemWidth.val(store.fixScaleWidthToIpad(_this.self.width()));
            _this.itemHeight.val(store.fixScaleHeightToIpad(_this.self.height()));
          }
        });
      }

      // 拖拽
      , setDraggable: function () {

        var _this = this;
        this.self.draggable({ containment: "parent",
          start: function () {
          },
          drag: function () {
            var pos = _this.self.position();
            _this.itemLeft.val(store.fixScaleWidthToIpad(pos.left));
            _this.itemTop.val(store.fixScaleHeightToIpad(pos.top));
          },
          stop: function () {
            var pos = _this.self.position();
            _this.itemLeft.val(store.fixScaleWidthToIpad(pos.left));
            _this.itemTop.val(store.fixScaleHeightToIpad(pos.top));
          }
        });
      }

      // 光标浮动
      , setHover: function () {

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

      // 可选
      , setSelect: function () {

        var _this = this;
        this.self.click(function () {

          // remove old widget selection css
          if (_this.list.activeWidget) {
            _this.list.activeWidget.self.css("z-index", 1);
            _this.list.activeWidget.border.removeClass("widget_border_selected");
          }

          _this.itemLeft.val(store.fixScaleWidthToIpad(_this.self.position().left));
          _this.itemTop.val(store.fixScaleHeightToIpad(_this.self.position().top));
          _this.itemWidth.val(store.fixScaleWidthToIpad(_this.self.width()));
          _this.itemHeight.val(store.fixScaleHeightToIpad(_this.self.height()));

          // set selection css
          _this.self.css("z-index", 10);
          _this.border.addClass("widget_border_selected");

          // set active widget
          _this.list.activeWidget = _this;

          store.cur_widget_id = _this.self.attr("id");

          var _action_change_event = function (e) {
            console.log($(e.target).val());
            $("#_action_type_image").css("display", "none");
            $("#_action_type_movie").css("display", "none");
            $("#_action_type_jump").css("display", "none");
            $("#_action_type_urlScheme").css("display", "none");

            if ($(e.target).val() == store._action_type.image) {
              $("#_action_type_image").css("display", "block");
              console.log(store._action_type.image);
            } else if ($(e.target).val() == store._action_type.movie) {
              $("#_action_type_movie").css("display", "block");
              console.log(store._action_type.movie);
            } else if ($(e.target).val() == store._action_type.jump) {
              $("#_action_type_jump").css("display", "block");
              $("#txt_action_type_jump").html('');
              for (var i in store.metadata) {
                $("#txt_action_type_jump").append("<option value=\"" + store.metadata[i].index + "\">" + (parseInt(i) + 1) + "</option>");
              }
              var _action_jump_event = function (e) {
                _this.autoSaveWidget(store._action_type.jump, _this);
              };
              $("#txt_action_type_jump").unbind("change").bind("change", _action_jump_event);
              $("a[name=okSaveWidget]").unbind("click").bind("click", function () {
                console.log("jump ok");
              });
              //动态保存
              _this.autoSaveWidget(store._action_type.jump, _this);
            } else if ($(e.target).val() == store._action_type.urlScheme) {
              console.log(store._action_type.urlScheme);
              $("#_action_type_urlScheme").css("display", "block");

            }

          };
          $("#action").unbind("change").bind("change", _action_change_event);
        });
      }, setBackground: function (img) {
        this.self.css("background-image", "#e4e4e4");
      }, show: function () {
        this.self.show();
      }, autoSaveWidget: function (type, widget_obj) {
        var that = this;
        var _cur_widget_id = store.cur_widget_id;
        var _cur_metadata_id = store.cur_metadata_id;
        var _cur_metadata = store.getMetadata(_cur_metadata_id);
        var _cur_metadata_index = store.getMetadataIndex(_cur_metadata_id);
        var _widget = store.getWidget(_cur_metadata_id, _cur_widget_id);
        if (type == store._action_type.jump) {
          _widget.name = widget_obj.itemName.val();
          _widget.top = widget_obj.itemTop.val();
          _widget.left = widget_obj.itemLeft.val();
          _widget.width = widget_obj.itemWidth.val();
          _widget.height = widget_obj.itemHeight.val();
          _widget.action = {};
          _widget.action.type = store._action_type.jump;
          _widget.action.value = widget_obj.itemJumpValue.val();
          store.setWidget(_cur_metadata_id, _cur_widget_id);
        }
      }, hide: function () {
        this.self.hide();
      }
    };
  };

  //// Widget控制面板 ////

  // 添加插件
  $("#btn_add_widget").bind("click", function (event) {
    if(store.cur_metadata_id.length==0){
      Alertify.log.error("请选择要编辑的画面");
      return;
    }
    var _obj = new WidgetFace();
    var widget_obj = {
      title: undefined,
      name: "未命名_" + store.widget_index,
      index: store.widget_index,
      widget_id: "widget" + store.widget_index,
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
    var create_obj = _obj.create(widget_obj);
    create_obj.init();
    store.addWidget(store.cur_metadata_id, create_obj);

    return false;
  });

  // 选择素材
  $("#btn_sel_material").bind("click", function (event) {

    return false;
  });

  // LEFT
  $("#txt_x").bind("change", function (event) {
    if (!widgetList.activeWidget) {
      return;
    }

    var position = widgetList.activeWidget.self.position();
    position.top = parseInt($(event.target).val());
    widgetList.activeWidget.self.css(position);
  });

  // TOP
  $("#txt_y").bind("change", function (event) {
    if (!widgetList.activeWidget) {
      return;
    }

    var position = widgetList.activeWidget.self.position();
    position.top = parseInt($(event.target).val());
    widgetList.activeWidget.self.css(position);
  });

  // Width
  $("#txt_width").bind("change", function (event) {
    if (!widgetList.activeWidget) {
      return;
    }

    widgetList.activeWidget.self.width(parseInt($(event.target).val()));
  });

  // Height
  $("#txt_height").bind("change", function (event) {
    if (!widgetList.activeWidget) {
      return;
    }

    widgetList.activeWidget.self.height(parseInt($(event.target).val()));
  });

  // Effect
  $("#animation").bind("change", function (event) {
    var effect = $(event.target).val();
    widgetList.activeWidget.self.attr("effect", effect);
  });

  // Action
  $("#action").bind("change", function (event) {
    var action = $(event.target).val();
    console.log("event");
  });

  // background

  // Name
  $("#txt_widget_name").bind("change", function (event) {
    var name = $(event.target).val();
    store.activeWidget.name = name;
  });


  // 添加 widgetList 对象
  $contents.view.widgetList = widgetList;

  $contents.view.widgetList.initWidgetlistFromMetadata(store.metadata);
});
