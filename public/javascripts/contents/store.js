/**
 * Created with JetBrains WebStorm.
 * User: Antony
 * Date: 13-8-22
 * Time: 下午7:11
 * To change this template use File | Settings | File Templates.
 */

var store = {
  activeWidget: undefined,
  activeSolution : undefined,
  activeLogo :undefined,
  //TODO : 去掉thumbs
  thumbs: [],
  coverrows: 1,
  covercols: 1,
  cover: [],
  //TODO :  去掉contents  转为 metadata
  contents: [],
  type: '',
  //对应后台的元素类型
  metadata: [],
  solution : [],
  metadata_index: 0,
  widget_index: 0,
  solution_index : 0 ,
  logo_index : 0 ,
  content_index: 0,
  cur_content_id: '',
  //当前编辑的metadata
  cur_metadata_id: '',
  //当前编辑的widget
  cur_widget_id: '',
  cur_solution_id : '',
  cur_logo_id : '',
  //动态的循环显示封面
  cover_interval: undefined,
  cover_interval_index: 0,
  _action_type: {image: "image", movie: "movie", jump: "jump", urlScheme: "urlScheme",none:"none"},
  _effect_type: {zoomAndMoveRightDown: "zoomAndMoveRightDown", zoom: "zoom", zoomOut: "zoomOut", moveRightUp: "moveRightUp", up: "up"},
  _synthetic_type: {imageWithThumb: "imageWithThumb", normal: 'normal', gallery: 'gallery', CaseView: "CaseView",solutionmap:"solutionmap" ,
    Introduction:"Introduction" },

  setLogo :function(metadata_id,logo){
    var _metadata = this.getMetadata(metadata_id);
    var _metadata_index = this.getMetadataIndex(metadata_id);
    if (_metadata) {
      for (var index in _metadata.logo) {
        var s = _metadata.logo[index];
        if (s.logo_id == logo.logo_id) {
          _metadata.logo[index] = logo;
          store.metadata[_metadata_index] = _metadata;
          break;
        }
      }
    }
  },
  setSolution : function(metadata_id,solution){
    var _metadata = this.getMetadata(metadata_id);
    var _metadata_index = this.getMetadataIndex(metadata_id);
    if (_metadata) {
      for (var index in _metadata.solution) {
        var s = _metadata.solution[index];
        if (s.solution_id == solution.solution_id) {
          _metadata.solution[index] = solution;
          store.metadata[_metadata_index] = _metadata;
          break;
        }
      }
    }
  },

  setCover : function(index , material_event){
    this.cover[index].material_id = material_event.material_id;
    this.cover[index].image = material_event.image;
  },
  addCover: function (image, material_id) {
    var that = this;
    var obj = {
//      fileid: fileid,
      material_id :material_id,
      image: image
    };
//    if (that.type == that._synthetic_type.normal) {
//      that.cover = [];
//      that.cover.push(obj);
//      return;
//    }
    that.cover.push(obj);
    that.fixManyCover();
  },
  add: function (_contents) {
    this.contents.push(_contents);
  },
  initWidgetList: function () {
    var that = this;
    var _widget = $contents.view.widgetList;
    _widget.initWidgetlistFromMetadata(that.metadata);
  },
  initSyntheticType: function (type) {
    var that = this;
    that.type = type;
  },
  initContents: function (getstore) {
    var that = this;
    console.log(getstore);
    that.contents = getstore;
  },
  initMetadata: function (getstore) {
    var that = this;
    var max_index = 0;
    that.metadata = getstore;
    for (var i in that.metadata) {
      var metadata_obj = that.metadata[i]
      if (metadata_obj.index != undefined) {
        if (that.metadata_index < metadata_obj.index) {
          max_index = metadata_obj.index;
        }
      }

    }
    that.metadata_index = max_index + 1;
    _.each(that.metadata, function (e, i) {
      //TODO : if(0)  bug
//      if (!e.index) {
//        e.index = that.metadata_index;
//        that.metadata_index++;
//      }
      if (!e.metadata_id) {
        e.metadata_id = "metadata_" + e.index;
      }
      if (!e.image) {
        if(e.material.thumb){
          e.image = smart.image_prefix() + e.material.thumb.middle;
        }else{
          e.image = smart.image_prefix() + e.material.fileid;
        }

      }
      if (e.txtmaterial) {
        if(e.txtmaterial.thumb){
          e.txtimage = smart.image_prefix() + e.txtmaterial.thumb.big;
        }else{
          e.txtimage = smart.image_prefix() + e.txtmaterial.fileid;
        }
      }
      that.metadata[i] = e;

    })
  },
  initCover: function (getstore) {
    var that = this;

    that.cover = getstore;
    that.fixCover();
  },
  fixCover: function () {
    var that = this;

    _.each(that.cover, function (e, i) {
      if (!e.image) {
        if (e.material.thumb) {
          e.image = smart.image_prefix() + e.material.thumb.big;
        } else {
          e.image = smart.image_prefix() + e.material.fileid;
        }
      }
      that.cover[i] = e;
    });
//      return;
    that.fixManyCover();
  },
  addMetadata: function (fileid,material_id) {
    var that = this;
    var metadata_id = "metadata_" + that.metadata_index;
    var obj = {
      index: that.metadata_index,
      fileid: fileid,
      metadata_id: metadata_id,
      material_id: material_id,
      image: smart.image_prefix() + fileid
    };
    if (store.type == store._synthetic_type.imageWithThumb) {
      obj.effect = "none";
    }
    that.metadata.push(obj);
    return that.metadata_index++;
  },
  getMetadata: function (metadata_id) {
    var that = this;
    for (var index in that.metadata) {
      var _obj = that.metadata[index];
      if (_obj.metadata_id == metadata_id) {
        return  _obj;
      }
    }
    return undefined;
  },
  getMetadataIndex: function (metadata_id) {
    var that = this;
    _metadata = [];
    for (var index in that.metadata) {
      var _obj = that.metadata[index];
      if (_obj.metadata_id == metadata_id) {
        return  index;
      }
    }
    return 0;
  },
  leftCover :function(index){
    var temp = this.cover[index];
    this.cover[index] = this.cover[index -1];
    this.cover[index - 1] = temp;
  },
  removeCover :function(index){
    this.cover.splice(index, 1); // 移除
  },
  rightCover :function(index  ){
    var temp = this.cover[index];
    this.cover[index] = this.cover[index + 1];
    this.cover[index + 1] = temp;
  },

  leftMetadata: function (index) {
    var temp = this.metadata[index - 1];
    this.metadata[index - 1] = this.metadata[index];
    this.metadata[index] = temp;
    return index;
  },
  rightMetadata: function (index) {
    var temp = this.metadata[index + 1];
    this.metadata[index + 1] = this.metadata[index];
    this.metadata[index] = temp;
    return index;
  },
  removeMetadata: function (index) {
    this.metadata.splice(index, 1); // 移除
  },
  setMetadata : function(index,material_event){
    this.metadata[index].material_id = material_event.material_id;
    this.metadata[index].image = material_event.image;
  },
  setTxtmetadata  : function(tmetadata){
    var _m_id = tmetadata.metadata_id;
    for(var i in this.metadata){
      if(this.metadata[i].metadata_id == _m_id){
          this.metadata[i] = tmetadata;
        return;
      }
    }
  },
  addContents: function (fileid, content_id) {
    var that = this;
    for (var index in that.contents) {
      var c = this.contents[index];
      if (c.fileid == fileid) {
        c.content_id = content_id;
        that.contents[index] = c;
        return that.contents[index];
      }
    }
  },
  get: function (id) {
    for (var index in this.contents) {
      var c = this.contents[index];
      if (c.content_id == id)
        return c;
    }
    return null;
  },
  addLogo : function(metadata_id,logo,_i){
    var _metadata = this.getMetadata(metadata_id);
    var _index = this.getMetadataIndex(metadata_id);
    if (_metadata) {
      _metadata.logo = _metadata.logo || [];

      if(_i){
        _metadata.logo[_i] = logo;
      }else{
        _metadata.logo.push(logo);
      }
    }
    this.metadata[_index] = _metadata;
    this.logo_index = this.logo_index + 1;
  },
  addSolution : function(metadata_id,solution,_i){
    var _metadata = this.getMetadata(metadata_id);
    var _index = this.getMetadataIndex(metadata_id);
    if (_metadata) {
      _metadata.solution = _metadata.solution || [];

      if(_i){
        _metadata.solution[_i] = solution;
      }else{
        _metadata.solution.push(solution);
      }
    }
    this.metadata[_index] = _metadata;
    this.solution_index = this.solution_index + 1;
  },
  addWidget: function (metadata_id, widget,_i) {
    var _metadata = this.getMetadata(metadata_id);
    var _index = this.getMetadataIndex(metadata_id);
    if (_metadata) {
      _metadata.widget = _metadata.widget || [];
      if (!widget.widget_id) {
        //Alertify.log.error("up the widget_id ");
        return null;
      }
      if(_i){
        _metadata.widget[_i] = widget;
      }else{
        _metadata.widget.push(widget);
      }

    }
    this.metadata[_index] = _metadata;
    this.widget_index = this.widget_index + 1;
  },
  addThumbs: function (fileid) {
    var that = this;
    var thumb = {
      fileid: fileid
    }
    that.thumbs.push(thumb);
  },
  setWidget: function (metadata_id, widget_) {
    var _metadata = this.getMetadata(metadata_id);
    var _metadata_index = this.getMetadataIndex(metadata_id);
    if (_metadata) {
      for (var index in _metadata.widget) {
        var w = _metadata.widget[index];
        if (w.widget_id == widget_.widget_id) {
          _metadata.widget[index] = widget_;
          store.metadata[_metadata_index] = _metadata;
          break;
        }
      }
    }
  },
  getWidget: function (metadata_id, widget_id) {
    var _metadata = this.getMetadata(metadata_id);
    if (_metadata) {
      _metadata.widget = _metadata.widget || [];
      for (var index in _metadata.widget) {
        var w = _metadata.widget[index];
        if (w.widget_id == widget_id)
          return w;
      }
    }
    return null;
  },
  fixWidth: function () {

  },
  fixHeight: function () {

  },
  fixManyCover: function () {
    if (store.cover_interval) {
      clearInterval(store.cover_interval);
    }
    ;
    var _fn = function () {
      var _index = store.cover_interval_index % store.cover.length;
      $(".cover_thumb img").attr("src", store.cover[_index].image);
      store.cover_interval_index++;
    };
    if (store.cover.length > 0){
      cover_interval = setInterval(_fn, 5000);
    }

  },
  stopCoverRunable: function () {
    if (store.cover_interval) {
      clearInterval(store.cover_interval);
    }
    ;
  },
  startCoverRunable: function () {
    var that = this;
    that.fixManyCover();
  },
  hideAllWidget: function () {
    var that = this;
    var count = 0;
    for (var i in that.metadata) {
      var _metadata = that.metadata[i];
      if (!_metadata) {
        continue;
      }
      if (_metadata.widget && _metadata.widget.length > 0) {
        for (var j in _metadata.widget) {
          $("#" + _metadata.widget[j].widget_id).css("display", "none");
          count++;
        }
      }
      if (_metadata.logo && _metadata.logo.length > 0) {
        for (var j in _metadata.logo) {
          $("#" + _metadata.logo[j].logo_id).css("display", "none");
          count++;
        }
      }
      if (_metadata.solution && _metadata.solution.length > 0) {
        for (var j in _metadata.solution) {
          $("#" + _metadata.solution[j].solution_id).css("display", "none");
          count++;
        }
      }
    }
    return count;
  },
  cleanWidget: function (metadata_id) {
    var that = this;
    var index = that.getMetadataIndex(metadata_id);
    that.metadata[index].widget = [];
  },
  fixSaveWidget: function () {
    var that = this;
    var _widget = $contents.view.widgetList;
    //clean ALl widget
    that.cleanWidget();
    for (var _i in _widget.widgets) {
      var e = _widget.widgets[_i];
      e.fixWidgetStore();
      var _widget_obj = {
        title: e.title,
        widget_id: e.widget_id,
        width: that.fixScaleWidthToIpad(e.width),
        height: that.fixScaleHeightToIpad(e.height),
        top: e.top,
        left: e.left,
        effect: e.effect,
        action: e.action,
        page: e.page
      };


      that.addWidget(e.page, _widget_obj);
    }
  },
  validatorSava: function () {
    var that = this;
    var auto_success = function () {

      return {valide: true};
    }
    var _rule_imageWithThumb = function (_metadata) {
      var _metadata_id = _metadata.metadata_id;
      var _error = function (err) {
        return {valide: false, metadata_id: _metadata_id, err: err};
      }
      var _success = function () {
        return {valide: true, metadata_id: _metadata_id};
      }
      if (!_metadata.effect) {
        return _error(i18n["js.public.error.store.effect"]);
      }
      if (!_metadata.txtmaterial_id || _metadata.txtmaterial_id == null) {
        return _error(i18n["js.public.error.store.txtfileid"]);
      }
      return _success();
    }

    var _rule_Introduction = function (_metadata) {
      var _metadata_id = _metadata.metadata_id;
      var _error = function (err) {
        return {valide: false, metadata_id: _metadata_id, err: err};
      }
      var _success = function () {
        return {valide: true, metadata_id: _metadata_id};
      }
      if (!_metadata.effect) {
        return _error("");
      }
      if (!_metadata.txtmaterial_id || _metadata.txtmaterial_id == null) {
        return _error("");
      }
    }
    if (that.type == that._synthetic_type.imageWithThumb) {
      for (var i in store.metadata) {
        var _metadata = store.metadata[i]
        var valide = _rule_imageWithThumb(_metadata);
        if (!valide.valide) {
          return valide;
        }
      }
      return auto_success();
    }
    //TODO : 全部类型的前台验证
    return auto_success();
  },
  fixScaleWidthToIpad: function (width) {
    return width / smart.scale_width($("#main_panel").width(), 1024);
  },
  fixScaleHeightToIpad: function (height) {
    return height / smart.scale_height($("#main_panel").height(), 723);
  },
  fixScaleWidthToWeb: function (width) {
    return width * smart.scale_width($("#main_panel").width(), 1024);
  },
  fixScaleHeightToWeb: function (height) {
    return height * smart.scale_height($("#main_panel").height(), 723);
  },
  getCureffect: function () {
    var that = this;
    if (store.cur_metadata_id) {
      var _metadata = store.getMetadata(store.cur_metadata_id);
      if (_metadata.effect && _metadata.txtmaterial_id) {
        return { effect: _metadata.effect, txtmaterial_id: _metadata.txtmaterial_id, txtimage: _metadata.txtimage }
      } else {
        return "none";
      }
    }
  },
  removeWidget: function (metadata_id, widget_id) {
    var _metadata = this.getMetadata(metadata_id);
    var _metadata_index = this.getMetadataIndex(metadata_id);
    for (var i in _metadata.widget) {
      if (_metadata.widget[i].widget_id == widget_id) {
        store.metadata[_metadata_index].widget = _.without(_metadata.widget, _metadata.widget[i]);
      }
    }

  },

  removeSolution : function(metadata_id,solution_id){
    var _metadata = this.getMetadata(metadata_id);
    var _metadata_index = this.getMetadataIndex(metadata_id);
    for (var i in _metadata.solution) {
      if (_metadata.solution[i].solution_id == solution_id) {
        store.metadata[_metadata_index].solution = _.without(_metadata.solution, _metadata.solution[i]);
      }
    }
  }




}