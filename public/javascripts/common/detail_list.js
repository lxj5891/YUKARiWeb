var DetailList = {
    create: function(){return {
        _this: this
        ,container: null
        ,id_prex: ""
        ,url: ""
        ,cols: []
        ,str: {
            loading: "加载中..."
        }
        ,tmpl_table_id: "template_detail_list"
        ,tmpl_item_id: "template_detail_list_item"
        ,table: undefined
        ,thead: undefined
        ,tbody: undefined
        ,tfoot: undefined
        ,head_pages: null
        ,foot_pages: null
        ,isShowTopPages: false
        ,init: function(container_, data) {
            var _this = this;
            if( typeof(container_) ===  "string")
                this.container = $(container_);
            else
                this.container = container_;

            this.id_prex = data.id_prex;
            this.url = data.url;
            // Copy左边有的字符串
            $sw.string.copyByLeft(this.str, data.str);

            // 初始化列
            this.cols = this._parse_cols(data.cols);

            this.isShowTopPages = data.isShowTopPages || false;

            // 初始化列表显示
            var tmpl_table = $('#' + this.tmpl_table_id).html();
            var res_table = _.template(tmpl_table, this);
            this.container.append(res_table);
            this.table = $('#' + this.id_prex + "_table");
            this.thead = $('#' + this.id_prex + "_thead");
            this.tbody = $('#' + this.id_prex + "_tbody");
            this.tfoot = $('#' + this.id_prex + "_tfoot");


            // 初始化分页
            this.head_pages = Pages.create();
            this.head_pages.init($("#" + this.id_prex + "_head_pages"), {
                owner: this
                , callback: this.load
            });
            this.foot_pages = Pages.create();
            this.foot_pages.init($("#" + this.id_prex + "_foot_pages"), {
                owner: this
                , callback: this.load
            });

//            // test
//            var testData = {
//                num: 1
//                ,start: 1
//                ,count: 3
//            };
//            this.head_pages.show(testData);
//            this.foot_pages.show(testData);
        }
        ,_parse_cols: function(cols) {
            var result = [];
            if(cols) {
                _.each(cols, function(col) {
                    var name, title;
                    if(typeof(col) == "string") {// 如果是字符串，data.cols本身是列名的数组
                        name = col;
                        title = undefined;
                    } else {// 如果不是字符串，data.cols本身是列对象的数组
                        name = col.name;
                        title = col.title;
                    }

                    if(title) { // 有自定义title的场合
                        result.push(col);
                    } else { // 没有自定义title的场合,使用默认的title
                        for(var i=0; i< DetailList.all_cols.length; i++) {
                            var c = DetailList.all_cols[i];
                            if(c.name == name) {
                                result.push(c);
                                break;
                            }
                        }
                    }
                });
            } else {
                result = DetailList.all_cols;
            }

            return result;
        }
        ,load: function(start, limit){
            var _this = this;
            start = start || 0;
            limit = limit || this.foot_pages.limit;
            var page = Math.floor(start / this.foot_pages.limit) + 1;

//            // for test
//            var d = {
//                apps: test_detail_list_data
//                ,isShowTopPages: this.isShowTopPages
//            };
//            this.load_end(d);
            var u = this.url;
            if(u.indexOf("?") < 0)
                u += "?";

            var category = this.category ? this.category: "";
            $.ajax({
                url: u + "&start=" + start + "&count=" + limit + "&category=" + category,
                type: "GET",
                async: true,
                dataType: "json",
                contentType: false,
                processData: false,
                start: start,
                limit: limit,
                page: page,
                success: function (result) {
                    if (result.error) {
                        alert(result.error.message)
                    } else {
                        _this.load_end({
                            start: this.start
                            ,limit: this.limit
                            ,page: this.page
                            ,apps: result.data
                            ,data: result.data
                            ,isShowTopPages: this.isShowTopPages
                        });
                    }
                },
                error: function (err) {
                    alert(err);
                }
            });
        }
        ,load_end: function(data_) {
            var _this = this;
            var apps = data_.apps;
            if(apps.items)
                apps = apps.items;

            var data = {
                cols: _this.cols
                ,apps: apps
            };
            var tmpl_item = $('#' + this.tmpl_item_id).html();
            var res_item = _.template(tmpl_item, data);
            this.tbody.html(res_item);

            // test
            var testData = {
                start: data.start
                ,count: data.limit
            };
            this.head_pages.clear();
            this.foot_pages.clear();
            //this.head_pages.show(testData);
            //this.foot_pages.show(testData);

            smart.pagination(data_.data.total, _this.foot_pages.limit, data_.page, this.foot_pages.container.attr("id"), function(){
                var pagenum = $(event.target).attr("id").split("_")[1];
                if(pagenum > 0){
                    var start = (pagenum -1 ) * _this.foot_pages.limit;
                    _this.load(start);
                }
                return false;
            });
        }
    }}};