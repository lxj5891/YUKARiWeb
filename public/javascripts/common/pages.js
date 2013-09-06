var Pages = {
    create: function(){return {
        container: null
        ,tmpl_id: "template_pages"
        ,start: 0
        ,limit: 20
        ,count: 0
        ,num: 0
        ,begin_num: 0
        ,end_num: 0
        ,count_num: 0
        ,limit_num: 20
        ,str: {
             prev_page: "前一页"
            ,next_page: "下一页"
        }
        ,owner: undefined
        ,callback: null
        ,init: function(container_, data) {
            if( typeof(container_) ===  "string")
                this.container = $(container_);
            else
                this.container = container_;

            data = data || {};
            this.id = data.id;
            this.range = data.range || this.range;
            this.tmpl_id = data.tmpl_id || this.tmpl_id;
            this.owner = data.owner;
            this.callback = data.callback;

            // Copy左边有的字符串
            $sw.string.copyByLeft(this.str, data.str);
        }
        ,show: function(data) {
            this.num = data.num;
            this.start = data.start;
            this.count = data.count;

            var tmpl = $("#" + this.tmpl_id).html();
            var result = _.template(tmpl, this);
            this.container.html(result);
            var _this = this;
            this.container.find('a').each(function(index){
                var page =  $(this).attr("page");
                //var _num = parseInt(page);
                var _start = _this.start_by_num(parseInt(page));


                if( page ) {
                    $(this).click(function() {
                        if(_this.callback)
                            _this.callback.call(_this.owner, _start, _this.limit);
                    });
                }
            });
        }
        ,clear: function() {
            this.container.html("");
        }
        ,start_by_num: function(num_) {
            return (num_ - 1) * this.limit;
        }
        ,_reset: function() {
            // 矫正start
            if(this.start > this.count - 1)
                this.start = this.count -1;
            if(this.start < 0)
                this.start = 0;

            // 重置当前页码
            this.num =  this.start / this.limit + 1;
            if(this.start % this.limit > 0)
                this.num +=  1;

            // 重置总页数
            this.count_num = this.count / this.limit + 1;
            if(this.count % this.limit > 0)
                this.count_num += 1;

            // 重置开始页数和结束页数
            if(!(this.num > this.begin_num || this.num < this.end_num)) {
                this.begin_num = this.num;
                this.end_num = this.begin_num + this.limit_num;
            }
            if(this.end_num > this.count_num)
                this.end_num = this.count_num;

        }
    }}};