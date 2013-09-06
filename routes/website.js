
exports.guiding = function (app) {

  app.get('/', function (req, res) {
    res.render("top_page", {"title": "login"});
  });

  // Login画面
  app.get('/login', function (req, res) {
    res.render("top_signin", {"title": "login"});
  });

  // 主画面
  app.get('/yukari', function (req, res) {
    res.render("yukari", {"title": "yukari", user: req.session.user});
  });

  // ----------------------
  // 用户
  app.get('/customer/user/add', function (req, res) {
    res.render("customer_user_update", {"title": "新規ユーザ", user: req.session.user});
  });
  app.get('/customer/user/edit/:id', function (req, res) {
    res.render("customer_user_update", {"title": "編集ユーザ", user: req.session.user});
  });
  app.get('/customer/user', function (req, res) {
    res.render("customer_user_list", {"title": "ユーザ一覧", user: req.session.user});
  });
  //一括登录
  app.get('/customer/user/import', function (req, res) {
    res.render("customer_user_import", {"title": "一括登録", user: req.session.user});
  });
  // 下载模板
  app.get('/customer/download/template', function(req, res){
    res.render("customer_user_import", {"title": "一括登録", user: req.session.user});
  });

  //组
    app.get('/customer/group', function (req, res) {
        res.render("customer_group_list", {"title": "グループ一覧", user: req.session.user});
    });
    app.get('/customer/group/add', function (req, res) {
      res.render("customer_group_update", {"title": "新規グループ", user: req.session.user});
    });
    app.get('/customer/group/edit/:id', function (req, res) {
        res.render("customer_group_update", {"title": "編集グループ", user: req.session.user});
    });

  //通知
    app.get('/customer/notice', function (req, res) {
        res.render("customer_notice", {"title": "notice", user: req.session.user});
    });
    app.get('/customer/notice/add', function (req, res) {
        res.render("customer_notice_add", {"title": "notice", user: req.session.user});
    });

  //workstation
    app.get('/customer/workstation', function (req, res) {
        res.render("customer_workstation", {"title": "workstation", user: req.session.user});
    });

  // 系统设定
  app.get('/customer/setup', function (req, res) {
    res.render("customer_setup", {"title": "setup", user: req.session.user});
  });


  // 设备
  app.get('/customer/device', function (req, res) {
    res.render("customer_device_list", {"title": "デバイス一覧", user: req.session.user});
  });

  // ----------------------
  // 素材
  app.get('/content/material', function (req, res) {
    res.render("content_material", {
        title: "素材"
      , user: req.session.user
    });
  });

  app.get('/content/synthetic/detail', function (req, res) {
    res.render("syntheticdetail", {"title": "synthetic", user: req.session.user});
  });

  // 布局
  app.get('/content/layout', function (req, res) {
    res.render("content_layout", {"title": "layout", user: req.session.user, publishFlag: 0, statusFlag:0});
  });

    // 公式
    app.get('/content/layout/publish', function (req, res) {
      res.render("content_layout", {"title": "layout", user: req.session.user, publishFlag: 1, statusFlag:0});
    });
    //申請中
    app.get('/content/layout/apply', function (req, res) {
        res.render("content_layout", {"title": "layout", user: req.session.user, publishFlag: 0, statusFlag:21});
    });
    //承認待ち
    app.get('/content/layout/confirm', function (req, res) {
        res.render("content_layout", {"title": "layout", user: req.session.user, publishFlag: 0, statusFlag:22});
    });

  app.get('/content/layout/add', function (req, res) {
    res.render("content_layout_add", {"title": "layout", user: req.session.user, layoutId:0, isCopy:"false"});
  });

  app.get('/content/layout/edit/:id', function (req, res) {
    res.render("content_layout_add", {"title": "layout", user: req.session.user, layoutId:req.params.id, isCopy:"false"});
  });

  app.get('/content/layout/copy/:id', function (req, res) {
    res.render("content_layout_add", {"title": "layout", user: req.session.user, layoutId:req.params.id, isCopy:"true"});
  });



  // 首页
  app.get('/top/index', function (req, res) {
    res.render("top_page", {"title": "top_page"});
  });
  app.get('/top/login', function (req, res) {
    res.render("top_signin", {"title": "top_signin"});
  });
  app.get('/top/detail', function (req, res) {
    res.render("top_details", {"title": "top_details"});
  });


  // ----------------------
  // 公司一览
    app.get('/admin/company/add', function (req, res) {
        res.render("admin_company_update", {"title": "新規顧客", user: req.session.user});
    });
    app.get('/admin/company/edit/:id', function (req, res) {
        res.render("admin_company_update", {"title": "編集顧客", user: req.session.user});
    });
    app.get('/admin/company/remove/:id', function (req, res) {
      res.render("admin_company_list", {"title": "顧客一覧", user: req.session.user});
    });
    app.get('/admin/company', function (req, res) {
        res.render("admin_company_list", {"title": "顧客一覧", user: req.session.user});
    });

  // 制作画面
  app.get('/make', function (req, res) {
    res.render("make", {"title": "customer", user: req.session.user});
  });
  // 运营情报
  app.get('/admin/operated', function (req, res) {
    res.render("admin_operated_list", {"title": "運行情報", user: req.session.user});
  });


  // ----------------------------------
  app.get('*', function (req, res) {
    res.send("404");
  });

};

