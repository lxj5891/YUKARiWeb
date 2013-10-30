/**
 * @file 存取布局信息的module
 * @author r2space@gmail.com
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var mongo   = require("mongoose")
  , conn    = require("./connection")
  , i18n      = require("i18n")
  , schema  = mongo.Schema;

/**
 * Layout
 * @type {schema} 布局schema
 */

var Layout = new schema({
    company: {type: String, description: ""}
  , layout: {
      name: {type: String, description: "名前"}
    , comment: {type: String, description: "说明"}
    , image: {
        imageH: {type: String, description: "横向全画面イメージ"}
      , imageV: {type: String, description: "竖向"}
      }
    , page: [{
        image: {type: String, description: "全画面イメージ"}
      , type: {type: Number, description: "1:横 2:縦"}
      , tile: [{
          num: {type: Number, description: "tile编号"}
        , rowspan: {type: Number, description: "行数"}
        , colspan: {type: Number, description: "列数"}
        , syntheticId: {type: String, description: "ネタID"}
        }]
      }]
    }
  , status: {type: Number, description: "1:未申請 2:申請中 3:否認 4:承認済み"}
  , publish: {type: Number, description: "1:あり 0:なし"}
  , confirmby: {type: String, description: "承認者"}
  , confirmat: {type: Date, description: "承認時間"}
  , applyat: {type: Date, description: "申请時間"}
  , viewerUsers: [{type: String, description: "公開先User"}]
  , viewerGroups: [{type: String, description: "公開先Group"}]
  , openStart: {type: Date, description: "公開开始日期"}
  , openEnd: {type: Date, description: "公開终止日期"}
  , editat: {type: Date, default: Date.now, description: "编集日期"}
  , editby: {type: String, description: "编集者"}
  , createat: { type: Date, default: Date.now, description: "创建日期"}
  , createby: {type: String, description: "创建者"}
  , valid: {type: Number, default: 1, description: "删除 0:无效 1:有效"}
  });

function model(dbname) {
  return conn(dbname).model("Layout", Layout);
}

exports.find = function (code, query, callback) {
  model(code).find(query, callback);
};

exports.count = function (code, query, callback) {
  model(code).count(query, callback);
};
// 添加
exports.add = function (code, layout, callback) {

  var Lay = model(code);

  new Lay(layout).save(function (err, result) {
    callback(err, result);
  });
};

exports.update = function (code, layoutId, layout, callback) {
  var lay = model(code);
//  layout.findOneAndUpdate(condition_, layout_, function(err, result){
//    callback_(err, result);
//  });
  lay.findByIdAndUpdate(layoutId, layout, function (err, result) {
    callback(err, result);
  });
};

exports.get = function (code, condition, callback) {
  var layout = model(code);
  layout.findOne(condition, function (err, result) {
    callback(err, result);
  });
};


// DELETE
exports.remove = function (code, uid, id, callback) {

  var layout = model(code);

  layout.findByIdAndUpdate(id, {valid: 0, editat: new Date(), editby: uid}, function (err, result) {
    callback(err, result);
  });
};

// COPY
exports.copy = function (code, uid, id, callback) {

  var layout = model(code);

  layout.findById(id, function (err, result) {

    var newdata = result._doc;
    delete newdata._id;
    newdata.createat = new Date();
    newdata.createby = uid;
    newdata.editat = new Date();
    newdata.editby = uid;
    newdata.layout.name = newdata.layout.name + i18n.__("js.mod.copy.title");
    layout.create(newdata, function (err, result) {
      callback(err, result);
    });
  });
};

//////////////////////////////////////////////////
// 获取一览
exports.getList = function (code, condition, start, limit, callback) {

  var layout = model(code);

  layout.find(condition)
    .skip(start || 0)
    .limit(limit || 20)
    .sort({editat: -1})
    .exec(function (err, result) {
      callback(err, result);
    });
};

// 获取件数
exports.total = function (code, condition, callback) {
  var layout = model(code);

  layout.count(condition).exec(function (err, count) {
    callback(err, count);
  });
};