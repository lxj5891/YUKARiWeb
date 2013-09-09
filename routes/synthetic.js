/**
 * Created with JetBrains WebStorm.
 * User: Antony
 * Date: 13-8-21
 * Time: 下午7:45
 * To change this template use File | Settings | File Templates.
 */

var user     = lib.api.user
  , util     = lib.core.util
  , file     = lib.api.dbfile
  , synthetic = require("../api/synthetic")
  , company  = require("../api/company");

exports.guiding = function(app){



  // 元素
  app.get('/content/synthetic', function (req, res) {
    res.render("content_synthetic", {
      title: "ネタ"
      , user: req.session.user
    });
  });
  // 元素
  app.get('/content/synthetic/add', function (req, res) {
    res.render("content_synthetic_add", {
      title: "ネタ編集"
      ,synthetic_id:''
      , user: req.session.user
    });
  });
  app.get('/content/synthetic/edit/:synthetic_id',synthetic.editSynthetic);
  app.post("/content/synthetic/save.json",synthetic.save);
  app.post("/content/synthetic/saveAll.json",synthetic.saveAll);
  app.post("/content/synthetic/getstore.json",synthetic.getStoreById);
  app.post("/content/synthetic/saveDescription.json",synthetic.saveDescription);

  // 获取元素一览
  app.get('/synthetic/list.json', function(req, res){
    synthetic.list(req, res);
  });

  app.delete('/synthetic/remove.json', function(req, res){
    synthetic.remove(req, res);
  });

  app.post('/synthetic/copy.json', function(req, res){
    synthetic.copy(req, res);
  });

}

