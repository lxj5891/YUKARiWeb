var $tplUtil = {
  format: function (tpl, args) {
    for (var i = 0; i < args.length; i++) {
      tpl = tpl.replace(new RegExp("\\{" + i + "\\}", "g"), args[i]);
    }
    return tpl;
  },

  version: '0.1'
}


var tpl_viewport = function () {
  var args = arguments;

}
var tpl_thumbPanel = function () {
  var args = arguments;
  return "<div id=\"thumb_panel\"></div>"
}

//var tpl_contentPanel = function () {
//  var args = arguments;
//  return "<div id=\"content_panel\"></div>"
//}
//
//var tpl_mainPanel = function () {
//  var args = arguments;
//  return "<div id=\"main_panel\"><img src=\"/static/images/logo-block.png\"></div>"
//}
//
//
//var tpl_widgetPanel = function () {
//  var args = arguments;
//  return "<div id=\"widget_panel\"></div>"
//}
//var tpl_widgetTitle = function () {
//  return "<div class=\"title\">\
//      <span>插件编辑</span>\
//      <div class=\"pull-right title_btn\">\
//        <a id=\"btn_add_widget\" data-toggle=\"modal\" href=\"#pickPlugin\" class=\"btn btn-default btn-sm\">添加插件</a>\
//      </div>\
//  </div>"
//}
//var tpl_widget_body = function (type) {
//  if (!type) {
//    if (type == 'view') {
//      return "<div class=\"widget_body\">" +
//        tpl_widget_list() +
//        "</div>";
//    } else {
//      return "<div class=\"widget_body\">" +
//        tpl_widget_edit() +
//        "</div>";
//    }
//  }
//  return "<div class=\"widget_body\">" +
//    tpl_widget_list() +
//    tpl_widget_edit() +
//    "</div>";
//}
//var tpl_widget_list_item = function () {
//  var args = arguments
//  var tpl = "<li class=\"list-group-item\" data=\"{1}\">{0}<div class=\"pull-right\"><a class=\"btn btn-default btn-xs\">删除</a></div></li>";
//  return $tplUtil.format(tpl, args);
//
//}
//var tpl_widget_list_item_none = function () {
//  return "<li class=\"list-group-item\">无插件 </li>";
//
//}
//var tpl_widget_list = function () {
//  return "<ul class=\"list-group\">" +
//    "<li class=\"list-group-item\">无插件 </li>" +
//    "</ul>";
//}
//
//var tpl_widget_edit = function () {
//  return "<form class=\"form-horizontal\" role=\"form\">\
//    <div class=\"form-group\">\
//      <label for=\"pickImg\" class=\"col-lg-3 control-label\">名称</label>\
//      <div class=\"col-lg-9\">\
//        <input type=\"text\" name=\"widget_name\" class=\"form-control\" >\
//      </div>\
//    </div>\
//    <div class=\"form-group\">\
//      <label for=\"pickImg\" class=\"col-lg-3 control-label\">背景</label>\
//      <div class=\"col-lg-9\">\
//      <a data-toggle=\"modal\" href=\"#pickImg\" class=\"btn btn-default btn-sm\">选择素材</a>\
//      </div>\
//    </div>\
//    <div class=\"form-group\">\
//      <label class=\"col-lg-3 control-label\">效果</label>\
//      <div class=\"col-lg-9\">\
//        <select class=\"form-control\">\
//          <option>选择效果</option>\
//          <option>2</option>\
//          <option>3</option>\
//          <option>4</option>\
//          <option>5</option>\
//        </select>\
//      </div>\
//    </div>\
//    <div class=\"form-group\">\
//      <label class=\"col-lg-3 control-label\">动作</label>\
//      <div class=\"col-lg-9\">\
//        <select class=\"form-control\">\
//          <option>选择效果</option>\
//          <option>2</option>\
//          <option>3</option>\
//          <option>4</option>\
//          <option>5</option>\
//        </select>\
//      </div>\
//    </div>\
//    <div class=\"form-group\">\
//      <label class=\"col-lg-3 control-label\">大小</label>\
//      <div class=\"col-lg-9\">\
//        <div class=\"row\">\
//          <div class=\"col-lg-4\">\
//            <input id=\"txt_width\" type=\"text\" name=\"widget_width\" class=\"form-control\" placeholder=\"宽度(px)\">\
//            </div>\
//            <div class=\"col-lg-4\">\
//              <input id=\"txt_height\" type=\"text\" name=\"widget_height\" class=\"form-control\" placeholder=\"高度(px)\">\
//              </div>\
//            </div>\
//          </div>\
//        </div>\
//        <div class=\"form-group\">\
//          <label class=\"col-lg-3 control-label\">位置</label>\
//          <div class=\"col-lg-9\">\
//            <div class=\"row\">\
//              <div class=\"col-lg-4\">\
//                <input id=\"txt_x\" type=\"text\"  name=\"widget_left\" class=\"form-control\" placeholder=\"坐标x(px)\">\
//                </div>\
//                <div class=\"col-lg-4\">\
//                  <input id=\"txt_y\" type=\"text\" name=\"widget_top\" class=\"form-control\" placeholder=\"坐标y(px)\">\
//                  </div>\
//                </div>\
//              </div>\
//            </div>\
//        <div class=\"form-group\">\
//      <label for=\"pickImg\" class=\"col-lg-3 control-label\">背景</label>\
//      <div class=\"col-lg-9\">\
//      <a class=\"btn btn-default btn-sm\">保存</a>\
//      <a class=\"btn btn-default btn-sm\">返回</a>\
//      </div>\
//    </div>\
//          </form>";
//}

var tpl_materialPopupImage = function () {
  var args = arguments;
  var tpl = "<div class=\"modalfix_box\">\
  <img src=\"{0}\" class=\"material_thumb\" data=\"{2}\" metadata_id=\"{3}\" material_id=\"{4}\">\
    <div class=\"modalfix_checkbox\" num=\"{5}\"><img src=\"{1}\"></div>\
    </div>";
  return $tplUtil.format(tpl, args);

}
var tpl_materialPopupVideo= function () {
  var args = arguments;
  var tpl = "<div class=\"modalfix_box\">\
  <video class=\"material_thumb\"  src=\"{0}\"  data=\"{2}\" metadata_id=\"{3}\" material_id=\"{4}\"></video>\
    <div class=\"modalfix_checkbox\"><img src=\"{1}\"></div>\
    </div>";
  return $tplUtil.format(tpl, args);

}
var tpl_matedata_thumb = function(){
  var args = arguments;
  var _tpl = function () {
    return "<div class=\"thumb_block\" >\
        <img class=\"thumb_block_img\" src=\"{0}\" data=\"{1}\" metadata_id=\"{2}\">\
          <span class=\"thumb_block_span\" data=\"{1}\" metadata_id=\"{2}\">移除</span>\
          <span class=\"thumb_block_left\" data=\"{1}\" metadata_id=\"{2}\">←</span>\
          <span class=\"thumb_block_right\" data=\"{1}\" metadata_id=\"{2}\">→</span>\
          </div>";
  };
  return $tplUtil.format(_tpl(), args);
}
var tpl_matedata_thumb_block = function () {
  return  "<a class=\"cover_add\">\
        <img src=\"/static/images/block.png\">\
        </a>";
};
var tpl_cover_block = function(){
  var args = arguments;
  var _tpl = function () {
    return "<div class=\"cover_block\">" +
      "        <img class=\"cover_block_img\" src=\"{0}\" data=\"{1}\" cover_id=\"{2}\"> " +
      "</div>";
  }
  return $tplUtil.format(_tpl(), args);
};
