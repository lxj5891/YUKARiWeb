var async     = require('async')
  , _         = require('underscore')
  , material  = require('./ctrl_material')
  , ctl_layout  = require('./ctrl_layout')
  , layout_publish   = require('../modules/mod_layout_publish')
  , synthetic = require('./ctrl_synthetic')
  , cutil  = require('../core/contentutil')
  , errors  = lib.core.errors;

exports.get = function(company_, uid_, target_, isPublish, callback_) {
  var data = {};

  var tasks = [];
  // Get Layout data
  tasks.push(function(cb) {
    if(isPublish) {
      layout_publish.get({company: company_, _id:target_}, function (err, layout) {
        if (err || !layout || !layout.active)
          return cb(new errors.InternalServer(__("api.layout.id.error") + target_), null);
        setLayout(data, layout.active);
        cb(err, data);
      });
    } else {
      ctl_layout.get(company_, uid_, target_, function(err, layout) {
        if (err || !layout)
          return cb(new errors.InternalServer(__("api.layout.id.error") + target_), null);
        setLayout(data, layout);
        cb(err, data);
      });
    }
  });

  // Create JSON Data
  tasks.push(function(data, cb){
//    async.parallel(
//      {
//        topMenuAnimations: function(callback) {
//          getTopMenuAnimations(layout, callback);
//        },
//        workstationMenu: function(callback) {
//          getWorkstationMenu(callback);
//        },
//        caseCount: function(callback) {
//          getCaseCount(callback);
//        },
//        tile: function(callback) {
//          getTile(callback);
//        }
//      },
//      function(err, data){
//        callback_(err, data);
//      }
//    );
    cb(undefined, data);
  });

  async.waterfall(tasks,function(err,result){
    return callback_(err, result);
  });
};

function setLayout(data, layout) {
  data.topMenuAnimations = [];
  data.caseCount = data.caseCount ? data.caseCount: 0;

  // 仅有两个page, 横屏和竖屏
  _.each(layout.layout.page, function(page, page_index){
    // Set caseCount
    if(page.type == 2 && page.tile) {
      data.caseCount = data.caseCount + page.tile.length;
    }

    // 遍历当前page的所有title
    _.each(page.tile, function(tile, tile_index) {
      tile = fixDoc(tile);

      // Set topMenuAnimations
      if(page.type == 1) { // 横屏
        if(tile.synthetic && tile.synthetic.cover && tile.synthetic.cover.length > 1) {// Set topMenuAnimations
          var area = cutil.covertToArea(tile);

          data.topMenuAnimations.push({
            area: [
              "" + parseInt(area.x),
              "" + parseInt(area.y),
              "" + parseInt(area.w),
              "" + parseInt(area.h)
            ]
            ,prefix: [ "topmenu" , page_index , tile_index ].join("-")
            ,count: tile.synthetic.cover.length
          });
        }

        // Set Tile
        setTile(data, page_index, tile, tile_index);
      }
    });
  });
}

function setTile(data, page_index, tile, tile_index) {
  data.tile = data.tile || {};

  // 已经被合并处理过的，跳过。
  if(data.tile[tile.num] || ! tile.synthetic)
    return;

  var t =  {};
  cutil.splitTileToMap(tile, data.tile, t); // 设置合并区域的tile

  var synthetic = tile.synthetic;
  var metadata = synthetic.metadata || [];

  // init
  if(synthetic.type == "imageWithThumb" || synthetic.type == "normal") { // 'normal' only for test
    t.prefix = [ "imageWithThumb" , page_index , tile_index ].join("-") + "-";
    t.type = "imageWithThumb";
    t.maxIndex = metadata.length - 1;

    // 是否有动画效果
    var isHasAnimation = synthetic.metadata && synthetic.metadata.length > 0&& synthetic.metadata[0].effect;
    if(isHasAnimation) {
      t.showSplashMovie = "1";
      var effects = _.pluck(synthetic.metadata, "effect");
      t.animationPage = [];
      t.animationType = {};
      _.each(effects, function(effect, effect_index) {
        t.animationType[effect_index] = effect;
        t.animationPage.push(effect_index + "");
      });
    }
  } else if(synthetic.type == "gallery") {
    t.prefix = [ "gallery" , page_index , tile_index ].join("-") + "-";
    t.type = "gallery";
    t.count = metadata.length;
    return;
  } else if(synthetic.type == "solutionmap") {
    t.type = "solutionmap";
    // TODO:未做
  } else if(synthetic.type == "mageWithImageMenu") {
    t.type = "imageWithImageMenu";
    // TODO:未做
  } else if(synthetic.type == "SDBPageWithAuth") {
    t.type = "SDBPageWithAuth";
    // TODO:未做
  } else if(synthetic.type == "Introduction") {
    t.type = "Introduction";
    // TODO:未做
  } else { // 不识别
    data.tile[tile.num] = undefined; // remove
    return;
  }

  // Set tapMap
  _.each(metadata, function(meta, meta_index) {
    var widgets = meta.widget || [];
    var tap_list = [];
    _.each(fixDoc(widgets), function(widget, widget_index) {
      // 动作
      var tap_data = {};
      if(widget.action && widget.action.type != "none") {
        if(widget.action.type == "image") {
          tap_data.image = [ "widget_image" , page_index , tile_index, meta_index, widget_index ].join("-") + '.png';
        } else if(widget.action.type == "movie") {
          tap_data.movie = [ "widget_movie" , page_index , tile_index, meta_index, widget_index ].join("-") + '.mp4';
        } else if(widget.action.type == "jump") {
          tap_data.jump = new String(widget.action.value - 1);
        }
        else if(widget.action.type == "urlScheme") {
          tap_data.urlScheme = widget.action.urlScheme;
          tap_data.downloadURL = widget.action.downloadURL;
        }

        // Set default value
        var x1 = parseInt(widget.left || 0);
        var y1 = parseInt(widget.top || 0);
        var x2 = parseInt(widget.left + widget.width);
        var y2 = parseInt(widget.top + widget.height);


        tap_data.area = [x1 + "", y1 + "", x2 + "", y2 + ""];
        tap_list.push(tap_data);
      }

    });

    // 设定tap到tapMap里
    if(tap_list.length > 0) {
      t.tapMap = t.tapMap ? t.tapMap : {};
      t.tapMap[meta_index] = tap_list;
    }
  });
}

function fixDoc(data) {
  if(!data)
    return;
  return data._doc ? data._doc : data;
}

