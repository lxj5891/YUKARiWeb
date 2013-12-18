/**
 * @file 存取照片和备注
 * @author xiangrui.zeng@gmail.com
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var mongo       = smart.util.mongoose
  , conn        = smart.framework.connection
  , schema      = mongo.Schema;

/**
 * @type {schema} conference schema
 */
var Conference = new schema({
    picture        : { type: String, description: "照片" }
  , comment        : { type: String, description: "备注" }
  , createat       : { type: Date,   description: "创建时间", default: Date.now }
  , createby       : { type: String, description: "创建者" }
  , editat         : { type: Date,   description: "修改时间", default: Date.now }
  , editby         : { type: String, description: "修改者" }
  , valid          : { type: Number, description: "删除 0: 无效 1: 有效", default: 1 }
  });

/**
 * 使用定义好的Schema，生成Conference的model
 * @returns {*} Conference model
 */
function model(dbname) {

  return conn(dbname).model("Conference", Conference);
}

/**
 * 添加新的Conference
 * @param code 编码
 * @param newConfe 新的conference
 * @param callback 返回添加结果
 */
exports.add = function(code, newConfe, callback) {

  var Conference = model(code);

  new Conference(newConfe).save(function(err, result){
    return callback(err, result);
  });
};