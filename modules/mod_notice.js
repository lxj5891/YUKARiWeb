/**
 * @file 存取通知的module
 * @author r2space@gmail.com
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var mongo       = require("mongoose")
  , conn        = require("./connection")
  , schema      = mongo.Schema;

/**
 * @type {schema} Notice schema
 */
var Notice = new schema({
    title      : {type: String, description: "标题"}
  , touser     : [ String ]
  , togroup    : [ String ]
  , notice     : {type: String, description: "通知内容"}
  , createat   : {type: Date,   description: "创建时间", default: Date.now }
  , createby   : {type: String, description: "创建者"}
  , editat     : {type: Date,   description: "修改时间", default: Date.now}
  , editby     : {type: String, description: "修改者"}
  , valid      : {type: Number, description: "删除 0:无效 1:有效", default:1}
  });

/**
 * 使用定义好的Schema，生成Notice的model
 * @returns {*} notice model
 */
function model(code) {

  return conn(code).model("Notice", Notice);
}

/**
 * 获取通知一览
 * @param code
 * @param condition 条件
 * @param start 数据开始位置
 * @param limit 数据件数
 * @param callback 返回通知一览
 */
exports.getList = function(code, condition, start, limit, callback) {

  var notice = model(code);

  notice.find(condition)
    .skip(start || 0)
    .limit(limit || 20)
    .sort({createat: -1})
    .exec(function(err, result) {
      return callback(err, result);
    });
};

/**
 * 添加通知
 * @param newNotice
 * @param callback
 */
exports.add = function(code, newNotice, callback) {

  var Notice = model(code);

  new Notice(newNotice).save(function(err, result) {
    return callback(err, result);
  });
};

/**
 * 查找通知
 * @param id
 * @param callback
 */
exports.findOne = function(code, id, callback) {

  var notice = model(code);

  notice.findOne({_id:id},function(err,docs) {
    return callback(err,docs);
  });
};

/**
 * 获取通知有效件数
 * @param condition
 * @param callback
 */
exports.total = function(code, condition, callback) {

  var notice = model(code);

  notice.count(condition).exec(function(err, count) {
    return callback(err, count);
  });
};
