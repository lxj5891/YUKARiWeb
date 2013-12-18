var
//  i     = smart.util.irequire("i18n")
   util  = require('../core/utils')
  , log   = smart.framework.log;
//  , logapi   = require("smartcore").api.log;

exports.guiding = function (app) {

  app.get('/', function (req, res) {

    log.operation("begin : show login");
    res.render("login", {"title": 111});
//    res.render("login", {"title": i.__("js.routes.website.top_signin.title")});
    log.operation("end : show login");
  });

  // Login画面
  app.get('/login', function (req, res) {

    log.operation("begin : show login");
    res.render("login", {"title": 1});
//    res.render("login", {"title": i.__("js.routes.website.top_signin.title")});
    log.operation("end : show login");
  });

  // 主画面
  app.get('/yukari', function (req, res) {

    log.operation("begin : show yukari top page");
    res.render("yukari", {"title": "yukari", user: req.session.user});
    log.operation("end : show yukari top page");
  });

  // ----------------------
  // 用户
  app.get('/customer/user/add', function (req, res) {

    log.operation("begin : show user add page");

    var sessionuser = req.session.user;
    //客户管理员,开发人员以外,不能访问.
    if (!(util.isAdmin(sessionuser) || util.isSuperAdmin(sessionuser)) ) {
      res.render("error_403", {user: req.session.user});
    } else {
      res.render("customer_user_update", {"title": i.__("js.routes.website.customer_user_add.title"), user: req.session.user,userId:""});
    }

    log.operation("end : show user add page");
  });
  app.get('/customer/user/edit/:id', function (req, res) {
    var sessionuser = req.session.user;
    //客户管理员,开发人员,自己以外,不能访问.
    if (req.params.id == req.session.user._id) {
      res.render("customer_user_update", {"title": i.__("js.routes.website.customer_user_update.title"), user: req.session.user,userId:req.params.id});
    } else {
      if (!(util.isAdmin(sessionuser) || util.isSuperAdmin(sessionuser))) {
        res.render("error_403", {user: req.session.user});
      } else {
        res.render("customer_user_update", {"title": i.__("js.routes.website.customer_user_update.title"), user: req.session.user,userId:req.params.id});
      }
    }

  });
  app.get('/customer/user', function (req, res) {
    var sessionuser = req.session.user;
    //客户管理员,开发人员以外,不能访问.
    if (!(util.isAdmin(sessionuser) || util.isSuperAdmin(sessionuser))) {
      res.render("error_403", {user: req.session.user});
    } else {
      res.render("customer_user_list", {"title": i.__("js.routes.website.customer_user_list.title"), user: req.session.user});
    }
  });
  //一括登录
  app.get('/customer/user/import', function (req, res) {
    res.render("customer_user_import", {"title": i.__("js.routes.website.customer_user_import.title"), user: req.session.user});
  });
  // 下载模板
  app.get('/customer/download/template', function(req, res){
    res.render("customer_user_import", {"title": i.__("js.routes.website.customer_user_import.title"), user: req.session.user});
  });
  //
  // DA管理员 创建用户
  app.get('/admin/user/add', function (req, res) {
    var sessionuser = req.session.user;
    //客户管理员,开发人员以外,不能访问.
    if (!(util.isSystemAdmin(sessionuser) || util.isSuperAdmin(sessionuser)) ) {
      res.render("error_403", {user: req.session.user});
    } else {
      res.render("admin_user_update", {"title": i.__("js.routes.website.customer_user_add.title"), user: req.session.user,userId:"",code:""});
    }
  });
  app.get('/admin/user/edit/:code/:id', function (req, res) {
    var sessionuser = req.session.user;
    //客户管理员,开发人员,不能访问.
    if (!(util.isSystemAdmin(sessionuser) || util.isSuperAdmin(sessionuser))) {
      res.render("error_403", {user: req.session.user});
    } else {
      res.render("admin_user_update", {"title": i.__("js.routes.website.customer_user_update.title"), user: req.session.user,userId:req.params.id,code:req.params.code});
    }

  });
  app.get('/admin/user', function (req, res) {
    var sessionuser = req.session.user;
    //客户管理员,开发人员以外,不能访问.
    if (!(util.isSystemAdmin(sessionuser) || util.isSuperAdmin(sessionuser))) {
      res.render("error_403", {user: req.session.user});
    } else {
      res.render("admin_user_list", {"title": i.__("js.routes.website.customer_user_list.title"), user: req.session.user});
    }
  });
  //组
    app.get('/customer/group', function (req, res) {
      var sessionuser = req.session.user;
      //DA管理员,不能访问.
      if (util.isSystemAdmin(sessionuser)) {
        res.render("error_403", {user: req.session.user});
      } else {
        res.render("customer_group_list", {"title": i.__("js.routes.website.customer_group_list.title"), user: req.session.user});
      }
    });
    app.get('/customer/group/add', function (req, res) {
      var sessionuser = req.session.user;
      //DA管理员,不能访问.
      if (util.isSystemAdmin(sessionuser)) {
        res.render("error_403", {user: req.session.user});
      } else {
        res.render("customer_group_update", {"title": i.__("js.routes.website.customer_group_add.title"), user: req.session.user,groupId:""});
      }
    });
    app.get('/customer/group/edit/:id', function (req, res) {
      var sessionuser = req.session.user;
      //DA管理员,不能访问.
      if (util.isSystemAdmin(sessionuser)) {
        res.render("error_403", {user: req.session.user});
      } else {
        res.render("customer_group_update", {"title": i.__("js.routes.website.customer_group_update.title"), user: req.session.user,groupId:req.params.id});
      }
    });

  //通知
    app.get('/customer/notice', function (req, res) {
      var sessionuser = req.session.user;
      //通知者,开发人员以外,不能访问.
      if (!util.hasNoticePermit(sessionuser)) {
        res.render("error_403", {user: req.session.user});
      } else {
        res.render("customer_notice", {"title": i.__("js.routes.website.customer_notice.title"), user: req.session.user});
      }
    });
    app.get('/customer/notice/add', function (req, res) {
      var sessionuser = req.session.user;
      //通知者,开发人员以外,不能访问.
      if (!util.hasNoticePermit(sessionuser)) {
        res.render("error_403", {user: req.session.user});
      } else {
        res.render("customer_notice_add", {"title": i.__("js.routes.website.customer_notice_add.title"), user: req.session.user});
      }
    });

  //workstation
    app.get('/customer/workstation', function (req, res) {
      if(!util.hasContentPermit(req.session.user)){
        res.render("error_403", {user: req.session.user});
      } else {
        res.render("customer_workstation", {"title": i.__("js.routes.website.customer_workstation.title"), user: req.session.user});
      }
    });
  //appicon
  app.get('/customer/appimage', function (req, res) {
    if(!util.hasContentPermit(req.session.user)){
      res.render("error_403", {user: req.session.user});
    } else {
      res.render("customer_appimage", {"title": i.__("js.routes.website.customer_appicon.title"), user: req.session.user});
    }

  });

  // 系统设定
  app.get('/customer/setup', function (req, res) {
    res.render("customer_setup", {"title":i.__("js.routes.website.customer_setup.title"), user: req.session.user});
  });


  // 设备
  app.get('/customer/device', function (req, res) {
    if (!(util.isAdmin(req.session.user)))
      res.render("error_403", {user: req.session.user});
    else
      res.render("customer_device_list", {"title": i.__("js.routes.website.customer_device_list.title"), user: req.session.user});
  });

  // ----------------------
  // 素材
  app.get('/content/material', function (req, res) {
    if(!util.hasContentPermit(req.session.user)){
      res.render("error_403", {user: req.session.user});
    } else {
      res.render("content_material", {
          title: i.__("js.routes.website.content_material.title")
        , user: req.session.user
      });
    }
  });

  // 布局
  app.get('/content/layout', function (req, res) {
    if(util.hasContentPermit(req.session.user) || util.hasApprovePermit(req.session.user)){
      res.render("content_layout", {"title": i.__("js.routes.website.content_layout.title"), user: req.session.user, publishFlag: 0, statusFlag:0});
    } else {
      res.render("error_403", {user: req.session.user});
    }
  });

    // 公式
    app.get('/content/layout/publish', function (req, res) {
      res.render("content_layout", {"title": i.__("js.routes.website.content_layout.title"), user: req.session.user, publishFlag: 1, statusFlag:0});
    });
    //申請中
    app.get('/content/layout/apply', function (req, res) {
      if(!util.hasContentPermit(req.session.user)){
        res.render("error_403", {user: req.session.user});
      } else {
        res.render("content_layout", {"title": i.__("js.routes.website.content_layout.title"), user: req.session.user, publishFlag: 0, statusFlag:21});
    }
    });
    //承認待ち
    app.get('/content/layout/confirm', function (req, res) {
      if(!util.hasApprovePermit(req.session.user)){
        res.render("error_403", {user: req.session.user});
      } else {
        res.render("content_layout", {"title": i.__("js.routes.website.content_layout.title"), user: req.session.user, publishFlag: 0, statusFlag:22});
      }
    });

  app.get('/content/layout/add', function (req, res) {
    if(!util.hasContentPermit(req.session.user)){
      res.render("error_403", {user: req.session.user});
    } else {
      res.render("content_layout_add", {"title": i.__("js.routes.website.content_layout_add.title"), user: req.session.user, layoutId:0, isCopy:"false"});
    }
  });

  app.get('/content/layout/edit/:id', function (req, res) {
    if(!util.hasContentPermit(req.session.user)){
      res.render("error_403", {user: req.session.user});
    } else {
      res.render("content_layout_add", {"title": i.__("js.routes.website.content_layout_update.title"), user: req.session.user, layoutId:req.params.id, isCopy:"false"});
    }
  });

  app.get('/content/layout/copy/:id', function (req, res) {
    if(!util.hasContentPermit(req.session.user)){
      res.render("error_403", {user: req.session.user});
    } else {
      res.render("content_layout_add", {"title": i.__("js.routes.website.content_layout_copy.title"), user: req.session.user, layoutId:req.params.id, isCopy:"true"});
    }
  });



//  // 首页
//  app.get('/top/index', function (req, res) {
//    res.render("top_page", {"title": "top_page"});
//  });
//  app.get('/top/login', function (req, res) {
//    res.render("top_signin", {"title": "top_signin"});
//  });
//  app.get('/top/detail', function (req, res) {
//    res.render("top_details", {"title": "top_details"});
//  });

  // 公司一览
  app.get('/admin/company/add', function (req, res) {
    var sessionuser = req.session.user;
    //DA系统管理员,开发人员以外的场合,不能访问.
    if (!util.isSystemAdmin(sessionuser)  && !util.isSuperAdmin(sessionuser)) {
      res.render("error_403", {user: req.session.user});
    } else {
      res.render("admin_company_update", {"title": i.__("js.routes.website.admin_company_add.title"), user: req.session.user,compId:""});
    }
  });
  app.get('/admin/company/edit/:id', function (req, res) {
    var sessionuser = req.session.user;
    //DA系统管理员,开发人员以外的场合,不能访问.
    if (!util.isSystemAdmin(sessionuser)  && !util.isSuperAdmin(sessionuser)) {
      res.render("error_403", {user: req.session.user});
    } else {
      res.render("admin_company_update", {"title": i.__("js.routes.website.admin_company_update.title"), user: req.session.user,compId:req.params.id});
    }
  });
  app.get('/admin/company', function (req, res) {
    var sessionuser = req.session.user;
    //DA系统管理员,开发人员以外的场合,不能访问.
    if (!util.isSystemAdmin(sessionuser)  && !util.isSuperAdmin(sessionuser)) {
      res.render("error_403", {user: req.session.user});
    } else {
      res.render("admin_company_list", {"title": i.__("js.routes.website.admin_company_list.title"), user: req.session.user});
    }
  });

  app.get('/admin/log', function (req, res) {
    var sessionuser = req.session.user;
    //DA系统管理员,开发人员以外的场合,不能访问.
    if (!util.isSystemAdmin(sessionuser)  && !util.isSuperAdmin(sessionuser)) {
      res.render("error_403", {user: req.session.user});
    } else {
      res.render("admin_log", {"title": i.__("js.routes.website.admin_log.title"), user: req.session.user, serverTime: new Date().getTime()});
    }
  });

  app.get('/admin/log/list.json', function (req, res) {
    var sessionuser = req.session.user;
    //DA系统管理员,开发人员以外的场合,不能访问.
    if (!util.isSystemAdmin(sessionuser)  && !util.isSuperAdmin(sessionuser)) {
      res.render("error_403", {user: req.session.user});
    } else {
      logapi.getLogList(req, res);
    }
  });

  app.get('/admin/log/detail.json', function (req, res) {
    var sessionuser = req.session.user;
    //DA系统管理员,开发人员以外的场合,不能访问.
    if (!util.isSystemAdmin(sessionuser)  && !util.isSuperAdmin(sessionuser)) {
      res.render("error_403", {user: req.session.user});
    } else {
      logapi.getLogDetail(req, res);
    }
  });

  // 运营情报
  app.get('/admin/operated', function (req, res) {
    res.render("admin_operated_list", {"title":  i.__("js.routes.website.admin_operated_list.title"), user: req.session.user});
  });
  app.get('/customer/operated', function (req, res) {
    res.render("customer_operated_list", {"title":  i.__("js.routes.website.admin_operated_list.title"), user: req.session.user});
  });
  // 元素
  app.get('/content/synthetic', function (req, res) {
    if(!util.hasContentPermit(req.session.user)){
      res.render("error_403", {user: req.session.user});
    } else {
      res.render("content_synthetic", {
        title: i.__("js.routes.synthetic.content_synthetic.title") , user: req.session.user
      });
    }
  });
  // 元素
  app.get('/content/synthetic/add', function (req, res) {
    if(!util.hasContentPermit(req.session.user)){
      res.render("error_403", {user: req.session.user});
    } else {
      res.render("content_synthetic_add", {
        title: i.__("js.routes.synthetic.content_synthetic_add.title") , synthetic_id:'' , user: req.session.user
      });
    }
  });
  app.get('/content/synthetic/add/:type', function (req_, res_) {
    if(!util.hasContentPermit(req_.session.user)){
      res_.render("error_403", {user: req_.session.user});
    } else {
      var type = req_.params.type;
      res_.render("content_synthetic_add", {
        title: i.__("js.routes.synthetic.content_synthetic_add.title")
        , synthetic_id : type
        , user: req_.session.user
      });
    }
  });
  //元素
  app.get('/content/synthetic/edit/:synthetic_id', function (req_, res_) {
    if(!util.hasContentPermit(req_.session.user)){
      res_.render("error_403", {user: req_.session.user});
    } else {
      var id = req_.params.synthetic_id;
      res_.render("content_synthetic_add", {
        title: i.__("js.routes.synthetic.content_synthetic_update.title")
        , synthetic_id : id
        , user: req_.session.user
      });
    }
  });
  //error
  app.get('/error/400', function (req, res) {
    res.render("error_400",{user: req.session.user});
  });
  app.get('/error/403', function (req, res) {
    res.render("error_403",{user: req.session.user});
  });
  app.get('/error/500', function (req, res) {
    res.render("error_500",{user: req.session.user});
  });
  // ----------------------------------
  app.get('*', function (req, res) {
    res.send("404");
  });


};

