/**
 * 搜索用户，组
 */
(function(User) {

  User.view = {

    model: undefined,
    active: undefined,            // 现在活动的输入框
    activeTotal: undefined,      // 選択される対象数
    itemInputContainer: undefined,// 输入框外围的容器（DIV）
    itemContainer: undefined,     // 检索结果显示框
    tmplRow: undefined,
    tmplBox: undefined,

    /**
     * 初始化
     */
    initialize: function(box, data, config) {

      this.model = User.model;

      this.tmplRow = $("#_user_list_template");
      this.tmplBox = $("#_user_box_template");
      this.itemFinder = $("#_findresult");
      this.itemFinderContainer = $("#_findresult ul");
      this.itemInputContainer = $("#" + box);
      this.active = $("#" + box + " input");

      var self = this;
      this.setDefaults(data);
      /**
       * config :
       *    検索対象     search_target = user|group|all , default: all
       *    選択件数     target_limit  = N , default: none
       *    対象権限     search_auth   = notice|approve , default: none
       */
      this.setConfig(config);

      /**
       * 绑定给定组件的键盘敲击事件
       */
      this.itemInputContainer.on("keydown", "input", function(event) {
        self.onPreSearch(event);
      });
      this.itemInputContainer.on("keyup", "input", function(event) {
        self.onSearch(event);
      });

      // 删除用户按钮的事件绑定
      this.itemInputContainer.on("click", "li", function(){
        $(this).parent().remove(); return false;
      });

      // 用户一览中选择用户的事件
      this.itemFinderContainer.on("click", "li", function(){
        var target = $(this).find("a")
          , uid = target.attr("uid")
          , uname = target.attr("uname")
          , type = target.attr("type");

        self.onRowSelected(uid, uname, type);
        self.itemFinder.hide();
        return false;
      });

    },

    /**
     * 显示用户一览
     */
    render: function (users, groups) {

      var self = this;
      this.itemFinderContainer.empty();
      this.itemFinder.hide();

      // 没有数据
      if ((!users || users.length <= 0) && (!groups || groups.length)) {
        return false;
      }

      _.each(users, function(user){
        var name = user.name.name_zh
          , photo = (user.photo && user.photo.small) ? "/picture/" + user.photo.small : "/images/user.png";
        self.itemFinderContainer.append(_.template(self.tmplRow.html(), {
          "id": user._id, "name": name, "photo": photo, "addition": user.title, "type": "user"
        }));
      });

      _.each(groups, function(group){
        var photo = (group.photo && group.photo.small) ? "/picture/" + group.photo.small : "/images/user.png";
        self.itemFinderContainer.append(_.template(self.tmplRow.html(), {
          "id": group._id, "name": group.name.name_zh, "photo": photo, "addition": i18n["js.public.common.group"], "type": "group"
        }));
      });

      this.itemFinder.css("top", self.active.offset().top + 31);
      this.itemFinder.css("left", self.active.offset().left);
      this.itemFinder.show();
    },

    setConfig: function(conf) {
      var self = this;
      if (!conf) {
        self.config = {};
        return;
      }

      if (!conf.search_target || (conf.search_target != "user" && conf.search_target != "group")) {
        conf.search_target = "all";
      }
      if (!conf.target_limit || conf.target_limit < 0) {
        conf.target_limit = 0;
      }
      if (!conf.search_auth || (conf.search_auth != "notice" && conf.search_auth != "approve")) {
        conf.search_auth = "";
      }
      self.config = conf;
    },

    /**
     * 设定缺省值
     * @param defaults
     */
    setDefaults: function(defaults) {

      var self = this;
      _.each(defaults, function(item){
        self.onRowSelected(item.uid, item.uname, item.type);
      });
    },

    /**
     * 检索结果中选择一行
     */
    onRowSelected: function(uid, uname, type){
      var container = this.active.parent()
        , item = _.template(this.tmplBox.html(), {"uid": uid, "uname": uname, "type": type})
        , limit= this.config.target_limit;

      item = item.replace(/\n/g, "").replace(/^[ ]*/, "");

      //選択上限を超過する場合、一番目のを削除
      if (limit && limit <= this.itemInputContainer.children("ol").length ) {
        this.itemInputContainer.children("ol")[0].remove();
      }
      $(item).insertBefore(this.active);

      // 设定光标
      this.active.val("").focus();
    },

    /**
     * 检索（KeyDown）
     */
    onPreSearch: function(event) {

      var src = this.active = $(event.target);

      var inputValue = src.val()
        , c = event.keyCode;

      // 退格键在输入框没有值的时候，删除元素
      if (c == 8 && inputValue.length <= 0 && src.prev().is("ol")) {
        src.prev().remove();
      }
    },

    /**
     * 检索（KeyUp）
     */
    onSearch: function(event) {

      var self = this
        , conf = self.config
        , src = this.active = $(event.target)
        , inputValue = src.val();

      conf.scope = src.attr("scope");
      conf.keywords = inputValue;

      // 关键字为空，则关闭检索框
      if (inputValue.length <= 0) {
        self.itemFinder.hide();
        return;
      }

      // 检索数据，显示一览
      this.model.fetch(conf, function(err, users, groups){
        self.render(users, groups);
      });
    }
  },

    // Define a Finder
    User.model = {

      initialize: function(options) {
      },

      fetch: function(conf, callback) {
        conf.start = 0;
        conf.count = 5;
        var url = "/user/search.json?"+ $.param(conf);

        smart.doget(url, function(err, result){
          callback(err, result.items.user, result.items.group);
        });
      },

      save: function() {
      }
    }

})(smart.view("user"));

