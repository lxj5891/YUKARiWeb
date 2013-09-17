
var user        = lib.api.user
  , group       = lib.api.group
  , search      = lib.api.search
  , util        = lib.core.util
  , file        = lib.api.dbfile
  , apn         = lib.api.apn
  , json        = lib.core.json
  , material    = require("../api/material")
  , synthetic   = require("../api/synthetic")
  , layout      = require("../api/layout")
  , company     = require("../api/company")
  , ctrl_company     = require("../controllers/ctrl_company")
  , definition  = require("../api/definition")
  , tag         = require("../api/tag")
  , notice      = require("../api/notice")
  , device      = require("../api/device")
  , workstation = require("../api/workstation")
  , admin_user = require("../api/admin_user")
  , errorsExt  = require("../core/errorsExt");

exports.guiding = function(app){

  // 登陆
  app.get('/simplelogin', function (req, res) {
    var logined = function() {
      if (req.session.user.type == 1) // 重新设定管理员画面
        req.query.home = "/admin";
    };

    var path = req.query.path; // 公司ID, Web登陆用
    var code = req.query.code; // 公司Code，iPad登陆用
    // 登陆到公司的DB进行Login
    if(path) {
      ctrl_company.getByPath(path, function(err, comp){
        if(err)
          return errorsExt.sendJSON(res, err);
        if(!comp)
          return errorsExt.sendJSON(res, errorsExt.NoCompanyID);
        var companyDB = comp.code;
        user.login(req, res, logined, companyDB);
      })
    // iPad登陆
    } else if(code) {
      ctrl_company.getByCode(code, function(err, comp){
        if(err)
          return errorsExt.sendJSON(res, err);
        if(!comp)
          return errorsExt.sendJSON(res, errorsExt.NoCompanyCode);
        var companyDB = comp.code;
        user.login(req, res, logined, companyDB);
      })
    // 登陆主DB进行Login
    } else {
      user.login(req, res, logined);
    }
  });

  // 注销
  app.get("/simplelogout", function (req, res) {
    req.query.home = "/top/login";
    user.logout(req, res);
  });

  // 获取图片
  app.get('/picture/:id', function(req, res){
    file.image(req, res, function(err, doc){
      res.send(doc);
    });
  });

  // APN通知用设备登陆
  app.put('/notification/addtoken.json', function(req, res){
    apn.update(req, res, function(err, doc){
      res.send(doc);
    });
  });

  // ----------------------------------
  // 上传文件到GridFS
  app.post('/material/add.json', function(req, res){
    material.add(req, res);
  });

  app.post('/material/updatefile.json', function(req, res){
    material.updatefile(req, res);
  });

  app.put('/material/updatetag.json', function(req, res){
    material.updatetag(req, res);
  });

  app.get('/material/list.json', function(req, res){
    material.list(req, res);
  });

  app.delete('/material/remove.json', function(req, res){
    console.log(req.body);
    material.remove(req, res);
  });

  app.get('/material/download.json', function(req, res){
    material.download(req, res);
  });
  app.get('/material/publish/download.json', function(req, res){
    material.download(req, res, true);
  });

  // ----------------------------------
  // 公司
  // 获取公司一览
  app.get('/company/list.json', function(req, res){
    company.list(req, res);
  });
  // 获取指定公司
  app.get('/company/findOne.json', function(req, res){
    company.searchOne(req, res);
  });
  // 添加公司
  app.post('/company/add.json', function(req, res){
    company.add(req, res);
  });
  // 更新指定公司
  app.put('/company/update.json', function(req, res){
    company.update(req, res);
  });
  // 无效化公司
  app.put('/company/active.json', function(req, res){
    company.active(req, res);
  });

  // ----------------------------------
  // 布局
  app.get('/layout/get.json', function(req, res){
    layout.get(req, res);
  });
  app.post('/layout/add.json', function(req, res){
    layout.add(req, res);
  });
  app.post('/layout/update.json', function(req, res){
    layout.update(req, res);
  });
  app.delete('/layout/remove.json', function(req, res){
    console.log(req.body);
    layout.remove(req, res);
  });
  app.post('/layout/copy.json', function(req, res){
    layout.copy(req, res);
  });
  app.post('/layout/apply.json', function(req, res){
      layout.apply(req, res);
  });
  app.post('/layout/confirm.json', function(req, res){
      layout.confirm(req, res);
  });
  app.get('/layout/list.json', function(req, res){
    layout.list(req, res);
  });
  app.get('/layout/list/history.json', function(req, res){
    layout.history(req, res);
  });
  // ----------------------------------
  // 获取iPad定义用json
  app.get('/setting.json', function(req, res){
    definition.get(req, res);
  });
  app.get('/publish/setting.json', function(req, res){
    definition.get(req, res, true);
  });

  // ----------------------------------
  // Notice
  app.post('/notice/add.json', function(req, res){
     notice.add(req, res);
  });
  app.get('/notice/list.json', function(req, res){
    notice.list(req, res);
  });

  // ----------------------------------
  // User
  app.get('/user/list.json', function(req, res){
    user.list(req, res);
  });
  app.get('/user/findOne.json', function(req, res){
    user.searchOne(req, res);
  });
  app.post('/user/add.json', function(req, res){
    user.add(req, res);
  });
  app.put('/user/update.json', function(req, res){
    user.update(req, res);
  });
  app.get('/user/search.json', function(req, res){
    search.user(req, res);
  });
  app.get('/user/download/template.json', function(req, res){
    user.downloadTemp(req, res);
  });
  app.post('/user/import/import.json', function(req, res){
    user.import(req, res);
  });

  //DA 管理员创建用户
  app.get('/admin/user/list.json', function(req, res){
    admin_user.adminlist(req, res);
  });
  app.get('/admin/user/findOne.json', function(req, res){
    admin_user.adminsearchOne(req, res);
  });
  app.post('/admin/user/add.json', function(req, res){
    admin_user.adminadd(req, res);
  });
  app.put('/admin/user/update.json', function(req, res){
    admin_user.adminupdate(req, res);
  });
  // ----------------------------------
  // Group
  app.get('/group/list.json', function(req, res){
    group.list(req, res);
  });
  app.get('/group/findOne.json', function(req, res){
    group.getGroup(req, res);
  });
  app.post('/group/add.json', function(req, res){
    group.createGroup(req, res);
  });
  app.put('/group/update.json', function(req, res){
    group.updateGroup(req, res);
  });
  app.get('/group/groupWithMember.json', function(req, res){
    group.getGroupWithMemberByGid(req, res);
  });
  // ----------------------------------
  // Tag
  app.get('/tag/search.json', function(req, res){
    tag.search(req, res);
  });
  //  device
  app.get('/device/list.json', function(req, res){
    device.list(req, res);
  });
  app.put('/device/allow.json', function(req, res){
    device.allow(req, res);
  });
  app.put('/device/deny.json', function(req, res){
    device.deny(req, res);
  });
  app.post('/device/add.json', function(req, res){
    device.add(req, res);
  });
  app.put('/device/add.json', function(req, res){
    device.add(req, res);
  });
  app.get("/device/login.json", function(req, res){
    device.login(req, res);
  });

  // 运营情报
  app.get('/operated/list.json', function (req, res) {
    company.companyListWithDevice(req,res);
  });



  app.post("/content/synthetic/save.json", function (req, res) {
    synthetic.save(req,res);
  });
  app.post("/content/synthetic/saveAll.json", function (req, res) {
    synthetic.saveAll(req,res);
  });
  app.post("/content/synthetic/getstore.json", function (req, res) {
    synthetic.getStoreById(req,res);
  });
  app.post("/content/synthetic/saveDescription.json", function (req, res) {
    synthetic.saveDescription(req,res);
  });
  // 获取元素一览
  app.get('/synthetic/list.json', function (req, res) {
    synthetic.list(req,res);
  });
  app.delete('/synthetic/remove.json', function (req, res) {
    synthetic.remove(req,res);
  });
  app.post('/synthetic/copy.json', function (req, res) {
    synthetic.copy(req,res);
  });

  // Workstation
  app.get('/workstation/list.json', function (req, res) {
    workstation.list(req,res);
  });
  app.get('/workstation/findOne.json', function (req, res) {
    workstation.findOne(req,res);
  });
  app.delete('/workstation/remove.json', function (req, res) {
    workstation.remove(req,res);
  });
  app.post('/workstation/update.json', function (req, res) {
    workstation.update(req,res);
  });
  app.post('/workstation/updateList.json', function (req, res) {
    workstation.updateList(req,res);
  });
};