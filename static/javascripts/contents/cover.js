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

  var cover = {
    init: function() {
      this.row = 1;
      this.col = 1;
      this.unique = 0;

      this.cover_preview_panel = $("#cover_preview_panel");
      this.cover_thumb = $("#cover_preview_panel .cover_thumb");
      this.cover_img = $("#cover_preview_panel .cover_thumb img");

      this.cover_panel = $("#cover_panel");
      this.cover_view = $("#cover_panel .cover_view");
      this.cover_block = $("#cover_panel .cover_block");
      this.cover_block_img = $("#cover_panel .cover_block_img");

      this.cover_preview_panel.show();
      this.cover_panel.show();
      this.setRow(this.row);
      this.setCol(this.col);

      //this.cover_view.css("height", (cover_h + 2) + "px");
      //ysl
      this.cover_view.css("height", 150 + "px");
      this.resetCoverViewSize();
    }
    // 初始化行列
    ,intRowCol: function(row_, col_){
      row_ = row_ || 1;
      col_ = col_ || 1;
      $("#cover_rowspan").val(row_);
      $("#cover_colspan").val(col_);
      this.setRow(row_);
      this.setCol(col_);
    }
    // 设置行数
    ,setRow: function(row_) {
      this.row = row_;
      var h = h_map[row_ - 1];
      this.cover_img.css("height", h + "px");
      this.cover_thumb.css("height", (h + 2) + "px");

      store.coverrows = row_;
      this.resetCoverViewSize();
    }
    // 设置列数
    ,setCol: function(col_) {
      this.col = col_;
      var w = w_map[col_ - 1];
      this.cover_img.css("width", w + "px");
      //ysl
      //this.cover_thumb.css("width", (w + 2) + "px");
      //this.cover_preview_panel.css("width", (w + 2) + "px");

      store.covercols = col_;
      this.resetCoverViewSize();
    },resetCoverViewSize: function(){
      var width = (this.col * cover_w) / (this.row * cover_h) * cover_h;
      var cover_cell_width = (width * (store.cover.length + 1)) + store.cover.length * 2;
      //this.cover_view.css("width", cover_cell_width + "px");
      this.cover_view.find('.cover_cell').css("width", cover_cell_width + "px");
      //ysl
      this.cover_view.find('.cover_cell').css("margin-top", 15 + "px");
      this.cover_view.find('.cover_block').css("width", width + "px");
      this.cover_view.find('.cover_block').css("height", cover_h + "px");
      this.cover_view.find('img').css("width", width + "px");
      this.cover_view.find('img').css("height", cover_h + "px");
    }
    // 插入图片
    ,insertCell: function(params) {
      var cover_cell = params.cover_cell;
      var image = params.image;
      var fileid = params.fileid;
      var move = params.move;

      var num = this.unique++;
      // 追加cover_block
      var tpl_params = {num: num, image: image, fileid: fileid, cover_id: '1'};
      var cover_add = cover_cell.children().last();
      cover_add.before(_.template($('#tmpl_cell_block').html(), tpl_params));

      this._insertToolBar(num); // 追加tools
    }
    // 插入工具条
    ,_insertToolBar: function (num) {
      var _this = this;
      // insert Tools
      var cell_block = $("#cell_block_" + num);
      var tools = _.template($('#tmpl_cell_toolbox').html(),{num: num });
      cell_block.append(tools);

      // 绑定操作事件
      var cell_tools = $("#cellTools_" + num);
      cell_tools.find("i").bind('click', function(){
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
      var thumb_blocks = $('.cover_block');

      thumb_blocks.each(function(index){
        var cur_num = $(this).attr('num');
        if(cur_num == num) {
          console.log( "cur_num :" + num );
          var selectedEvent = function(event){
            if (event.material_id != undefined) {
              var _img = $("#cell_block_" + num + " .cover_block_img");
              _img.hide();
              _img.attr("src",event.image);
              _img.fadeIn(1500);
              store.setCover(index , event);
            }
          };
          var _popup = new ImagePopup({ type: 'single', tpl: 'image', el: 'pickThumbPic' }, selectedEvent);
          _popup.show();
          return false;
        }
      });
    }
    // 移除图片
    ,removeCell: function(num) {
      var cover_blocks = $('.cover_block');
      cover_blocks.each(function(index){
         var cur_num = $(this).attr('num');
         if(cur_num == num) {
           store.removeCover(index);
           $(this).remove();

           $(".cover_cell .cover_add").show();

           return false;
         }
      });
    }
    // 左移图片
    ,moveCell: function(num, direction) {
      var cover_blocks = $('.cover_block');
      var last_index = cover_blocks.length -1;
      var cur_index = -1;
      cover_blocks.each(function(index){
        var cur_num = $(this).attr('num');
        if(cur_num == num) {
          cur_index = index;
          return false;
        }
      });

      if(direction == "left" && cur_index > 0) {
        var cur = cover_blocks[cur_index];
        var pre = cover_blocks[cur_index - 1];

        $(cur).hide();
        $(pre).hide();
        store.leftCover(cur_index);
        $(pre).before($(cur));
        $(cur).fadeIn(500);
        $(pre).fadeIn(1500);
      }
      if(direction == "right" && cur_index <last_index) { // right
        var cur = cover_blocks[cur_index];
        var next = cover_blocks[cur_index + 1];

        $(cur).hide();
        $(next).hide();

        store.rightCover(cur_index);
        $(next).after($(cur));

        $(cur).fadeIn(500);
        $(next).fadeIn(1500);
      }
    }
  }

  // 设置占的行数
  $("#cover_rowspan").bind('change', function(event){
    cover.setRow(parseInt(this.value));
  });

  // 设置占的列数
  $("#cover_colspan").bind('change', function(event){
    cover.setCol(parseInt(this.value));
  });

  cover.init();
  $contents.view.cover = cover;
});