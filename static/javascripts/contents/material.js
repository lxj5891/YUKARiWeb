$(function () {
  'use strict';


  //var screen_w = 706;
  //var screen_h = 500;
  //ysl
  var screen_w = 600;
  var screen_h = 400;
  var cover_w = Math.round(screen_w /3); // 封面的宽度
  var cover_h = Math.round(screen_h /3); // 封面的高度

  var w_map = [ cover_w, cover_w * 2, screen_w ];
  var h_map = [ cover_h, cover_h * 2, screen_h ];

  var material = {
    init: function() {
      this.unique = 0;

    }
    , resetSize: function() {
      var len = $('.thumb_block').length + 1;
      var material_cell = $(".material_cell");
      var cell_add_img = $("#thumb_panel .cover_add img");
      material_cell.css("width", len * (200 + 4) );

      material_cell.children().css("width", 200);
      material_cell.children().css("height", 130);
      cell_add_img.css("width", 200);
      cell_add_img.css("height", 130);
    }
    // 插入图片
    ,insertCell: function(params) {
      var material_cell = params.material_cell;
      var image = params.image;
      var fileid = params.fileid;
      var metadata_id = params.metadata_id;

      var num = this.unique++;
      var tpl_params = {num: num, image: image, fileid: fileid, metadata_id: metadata_id};
      var cell_add = material_cell.children().last();
      cell_add.before(_.template($('#tmpl_thumb_block').html(), tpl_params));

      this._insertToolBar(num); // 追加tools

      this.resetSize();
    }
    // 插入工具条
    ,_insertToolBar: function (num) {
      var _this = this;
      // insert Tools
      var thumb_block = $("#thumb_block_" + num);
      var tools = _.template($('#tmpl_thumb_toolbox').html(),{num: num });
      thumb_block.append(tools);

      // 绑定操作事件
      var thumb_tools = $("#thumbTools_" + num);
      thumb_tools.find("i").bind('click', function(){
        var tool = $(this);
        var opt = tool.attr('option');
        var num = tool.attr('num');
        if( opt == 'remove'){
          _this.removeCell(num);
        }
        if(opt == 'left' || opt == 'right'){
          _this.moveCell(num, opt);
        }
        if(opt == 'edit'){
          _this.editCell(num, opt);
        }
      });
    }
    ,editCell: function(num){
      var _this = this;
      var thumb_blocks = $('.thumb_block');

      thumb_blocks.each(function(index){
        var cur_num = $(this).attr('num');
        if(cur_num == num) {
          console.log( "cur_num :" + num );

          var selectedEvent = function(event){
            console.log("_callbackFn e  " +event );
            var _img = $("#thumb_block_" + num + " .thumb_block_img");
            _img.hide();
            _img.attr("src",event.image);
            _img.fadeIn(1500);
            store.setMetadata(index,event);
          };

          var _popup =  new ImagePopup({ type:'single', tpl:'image', el:'pickThumbPic' }, selectedEvent);
          _popup.show();
          return false;
        }
      });
    }
    // 移除图片
    ,removeCell: function(num) {
      var _this = this;
      var thumb_blocks = $('.thumb_block');
      thumb_blocks.each(function(index){
         var cur_num = $(this).attr('num');
         if(cur_num == num) {
           store.removeMetadata(index);
           $(this).remove();
           _this.resetSize();
           $(".material_cell .cover_add").show();
           return false;
         }
      });
    }
    // 左移图片
    ,moveCell: function(num, direction) {
      var thumb_block = $('.thumb_block');
      var last_index = thumb_block.length -1;
      var cur_index = -1;
      thumb_block.each(function(index){
        var cur_num = $(this).attr('num');
        if(cur_num == num) {
          cur_index = index;
          return false;
        }
      });

      if(direction == "left" && cur_index > 0) {
        var cur = thumb_block[cur_index];
        var pre = thumb_block[cur_index - 1];
        $(cur).hide();
        $(pre).hide();
        store.leftMetadata(cur_index);
        $(pre).before($(cur));
        $(cur).fadeIn(500);
        $(pre).fadeIn(1500);
      }
      if(direction == "right" && cur_index <last_index) { // right
        var cur = thumb_block[cur_index];
        var next = thumb_block[cur_index + 1];
        $(cur).hide();
        $(next).hide();
        store.rightMetadata(cur_index);
        $(next).after($(cur));
        $(cur).fadeIn(500);
        $(next).fadeIn(1500);
      }
    }
  }

  material.init();
  $contents.view.material = material;
});