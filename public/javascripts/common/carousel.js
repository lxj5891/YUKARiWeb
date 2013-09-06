var Carousel = {
    create: function(){return {
        container: null
        ,name: ""
        ,tmpl_id: "template_carousel"
        ,tmpl_carousel_item_group_id: "template_carousel_item_group"
        ,tmpl_carousel_item_id: "template_carousel_item"
        ,item_count: undefined
        ,_group_item_count: 4
        ,_group_max_count: 5
        ,category: undefined
        ,init: function(container_, data) {
            var _this = this;
            if( typeof(container_) ===  "string")
                this.container = $(container_);
            else
                this.container = container_;

            this.name = data.name;
            this.url = data.url;

            this.item_count = this.item_count ? this.item_count : this._group_item_count * this._group_max_count;
        }
        ,getId: function(id_name) {
            return this.name + "_" + id_name;
        }
        ,getTmpl: function(id) {
            return $('#' + id).html();
        }
        ,get_new_list_url: function() {
            var crsf = $("#_csrf").val();
            return "/app/list.json?_csrf=" + crsf + "&start=0&sort=update_date";
        }
        ,get_download_list_url: function() {
            var crsf = $("#_csrf").val();
            return "/app/list.json?_csrf=" + crsf + "&start=0&sort=downloadCount";
        }
        ,get_comment_list_url: function() {
            var crsf = $("#_csrf").val();
            return "/app/list.json?_csrf=" + crsf + "&start=0&sort=rank";
        }
        ,load: function(data){
            var _this = this;
            var tmpl_loading = this.getTmpl("template_loading");
            this.container.html(tmpl_loading);
            var category = this.category ? this.category: "";
            $.ajax({
                url: this.url + "&count=" + this.item_count + "&category=" + category,
                type: "GET",
                async: true,
                dataType: "json",
                contentType: false,
                processData: false,
                success: function (result) {
                    if (result.error) {
                        alert(result.error.message)
                    } else {
                        _this.load_end(result.data);
                    }
                },
                error: function (err) {
                    alert(err);
                }
            });
        }
        ,load_end: function(data) {
            var _this = this;
            var tmpl_carousel = this.getTmpl(this.tmpl_id);
            var tmpl_carousel_item_group = this.getTmpl(this.tmpl_carousel_item_group_id);
            var tmpl_carousel_item = this.getTmpl(this.tmpl_carousel_item_id);
            var id_carousel = this.getId("carousel");
            var id_item_group_container = this.getId("item_group_container");

            if(!data.items || data.items.length == 0) {
                this.container.html("没有数据");
                return;
            }

            //初始化框架
            var page_count = Math.floor(data.items.length / this._group_item_count);
            if(data.items.length % this._group_item_count > 0)
                ++page_count;

            var result = _.template(tmpl_carousel, {
                id_carousel: id_carousel
                ,id_item_group_container: id_item_group_container
                ,page_count: page_count
            });
            this.container.html(result);

            // 取消自动滚动
            $("#" + id_carousel).carousel({ interval: 0 });

            // 追加项目
            var item_container;
            var item_group_count = 0;
            var item_group_container = $('#' + id_item_group_container);
            for(var i=0; i < data.items.length; i++) {
                if(i % this._group_item_count == 0) {
                    // 开始追加当前组的容器
                    item_group_count++;
                    var id_item_container = this.getId("item_container" + item_group_count);
                    var res = _.template(tmpl_carousel_item_group, {
                        id_item_container: id_item_container
                        ,active: (i == 0) ? "active": ""
                    });
                    item_group_container.append(res);
                    item_container = $('#' + id_item_container);
                }

                //追加表示项目
                var app = data.items[i];
                var res = _.template(tmpl_carousel_item, {id_item: this.getId("item" + i), app: app});
                item_container.append(res);
            }

            // 设置图片高度
            this._reset_image_height();
        }
        ,_reset_image_height: function() {
            var carousel_image_height;
            var id_carousel = this.getId("carousel");
            $("#" + id_carousel + " .carousel-image").each(function(){
                if(carousel_image_height) {
                    $(this).css({'height': carousel_image_height + "px"});
                } else {
                    carousel_image_height = $(this).width();
                    $(this).css({'height': carousel_image_height + "px"});
                }
            });
        }
    }}};