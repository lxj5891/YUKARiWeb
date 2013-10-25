var i18n    = require('i18n')
  , fs      = require('fs')
  , log       = lib.core.log;

var top_offset = 1;     // 页顶部偏移1px
var bottom_offset = 1;  // 页底部偏移1px
var cover_w = 340;      // 一格的宽度
var cover_h = 239;      // 一格的高度
var rows = 3;           // 九宫格的行数必需是3
var cols = 3;           // 九宫格的列数必需是3
var border = 2;         // 九宫格内边框的Size 2px

// 每行的x,y,width,height的映射表，因为固定三行三列，所以用如下固定的写法。
var x_map = [0, border + cover_w, 2*(border + cover_w)];
var y_map = [0, border + cover_h, 2*(border + cover_h)];
var w_map = [cover_w, border + 2*cover_w, 2*border + 3*cover_w];
var h_map = [cover_h, border + 2*cover_h, 2*border + 3*cover_h];

/**
 * 转换指定page和tile的Area信息
 * @param page_index
 * @param tile
 * @returns {{x: number, y: number, w: number, h: number}}
 */
exports.covertToArea = function(tile){
  var page_index = Math.ceil(tile.num / 9) -1;      // 当前页索引
  var num = tile.num - page_index * 9;              // 当前页内的num
  var top = page_index * exports.getLayoutHeight()
            + top_offset;                           // 当前页的top
  var row = Math.ceil(num / cols) - 1;              // tile在当前页的行索引
  var col = num - row * cols - 1;                   // tile在当前页的列索引

  return {
    x: x_map[col],
    y: y_map[row] + top,
    w: w_map[tile.colspan -1],
    h: h_map[tile.rowspan -1]
  };
}

/**
 *  转换指定 CaseMenu item 的Area信息
 * @param item_index
 * @returns {{x: number, y: number, w: number, h: number}}
 */
exports.covertToAreaForCaseMenu = function(item_index){
  return {
    x: item_index * exports.getCaseMenuItemWidth(),
    y: 0,
    w: exports.getCaseMenuItemWidth(),
    h: exports.getCaseMenuItemHeight()
  };
}

/**
 * 拆分合并的tile,将tile的数据保存到map中
 * @param tile
 * @param map
 * @param tile_data
 */
exports.splitTileToMap = function(tile, map, tile_data) {
  var list = exports.splitTileNum(tile);
  for(var index in list) {
    var num = list[index];
    map[num] = tile_data;
  }
}

/**
 * 拆分合并的tile,返回num的数组
 * @param tile
 * @returns {Array}
 */
exports.splitTileNum = function(tile) {
  var list = [];
  var row = Math.ceil(tile.num / cols) - 1;              // tile的行索引
  var col = tile.num - row * cols - 1;                   // tile的列索引

  //log.out("info", "==== tile.num: " + tile.num + " ; rowspan: " + tile.rowspan + " ; colspan: " + tile.colspan);
  for(var i = 0; i < tile.rowspan; i++) {
    for(var j = 0; j < tile.colspan; j++) {
      var num = tile.num + i * cols + j;

      //log.out("info", "--- num:" + " ; num:" + num);
      list.push(num);
    }
  }

  return list;
}

/**
 * 取得一页Layout的宽度
 * @returns {*}
 */
exports.getLayoutWidth = function() {
  return w_map[2];
}

/**
 * 取得一页Layout的高度
 * @returns {*}
 */
exports.getLayoutHeight = function() {
  return h_map[2] + top_offset + bottom_offset;
}

/**
 * 取得 CaseMenu item 的宽度
 * @returns {*}
 */
exports.getCaseMenuItemWidth = function() {
  return 106;
}

/**
 * 取得 CaseMenu item 的高度
 * @returns {number}
 */
exports.getCaseMenuItemHeight = function() {
  return 84;
}

