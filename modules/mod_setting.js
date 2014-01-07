/**
 * @file 存取配置信息的module
 * @author r2space@gmail.com
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var mongo = smart.util.mongoose
  , conn = smart.framework.connection
  , schema = mongo.Schema;

/**
 * @type {schema} 配置schema
 */
var Setting = new schema({
    key        : { type: String, description: "键" }
  , val        : { type: String, description: "值" }
  , valid      : { type: Number, description: "删除 0:无效 1:有效", default:1 }
  , createat   : { type: Date,   description: "创建时间",default:new Date() }
  , createby   : { type: String, description: "创建者" }
  , editat     : { type: Date,   description: "最终修改时间", default:new Date() }
  , editby     : { type: String, description: "最终修改者" }
  });

/**
 * 使用定义好的Schema，生成Setting的model
 * @returns setting model
 */
function model(code) {
  return conn.model(code,"Setting", Setting);
}

/**
 * 获取配置一览
 * @param code 数据库标识
 * @param keys 键列表
 * @param callback 返回配置列表
 */
exports.getListByKeys = function(code , keys , callback) {
  var key = model(code);
  key.find({"key":{ "$in" : keys } }).exec(function(err, result) {
    callback(err, result);
  });
};

/**
 * 添加配置
 * @param code 数据库标识
 * @param item 配置信息
 * @param callback 返回配置
 */
exports.add = function(code, item, callback) {

  var Dev =  model(code);
  model(code).findOne({key : item.key },function(err, result) {

    if(!result) {
      new Dev(item).save(function(err, result) {
        callback(err, result);
      });
    }else{
      result.val = item.val;
      result.editby = item.editby;
      result.editat = new Date();
      result.save(callback);
    }

  });

};

