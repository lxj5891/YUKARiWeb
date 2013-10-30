/**
 * @file 存取素材信息的module
 * @author sl_say@hotmail.com
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var mongo     = require("mongoose")
  , conn       = require("./connection")
  , schema     = mongo.Schema;

/**
 * 文件实体存放到GridFS中，此处存储文件情报（部分信息和GridFS冗余）
 * 由于GridFS无法进行update，所以此处也负责维护文件的历史情报
 *  @type {schema}
 */
  //TODO 缺少创建者,创建日,删除Flag字段,素材长度什么意思
var Material = new schema({
    fileid      : { type: String, description: "GridFSのID" }
  , thumb       : {
      big       : { type: String, description: "大缩略图" }
    , middle    : { type: String, description: "中缩略图" }
    , small     : { type: String, description: "小缩略图" }
    }
  , filename    : { type: String, description: "素材名" }
  , editat      : { type: Date,   description: "修改时间" }
  , editby      : { type: String, description: "修改者" }
  , chunkSize   : { type: Number, description: "素材大小" }
  , contentType : { type: String, description: "素材类型" }
  , length      : { type: Number, description: "素材长度" }
  , tags        : [String]
  });

/**
 * 使用定义好的Schema,通过公司Code生成Material的model
 * @param {string} 公司code
 * @returns {model} material model
 */
function model(code) {

  return conn(code).model("Material", Material);
}

/**
 * 获取素材件数
 * @param {string} code 公司code
 * @param {object} conditions 条件
 * @param {function} callback 返回素材件数
 */
//TODO 和total函数重复,删除?
exports.count = function(code, conditions, callback) {

  var file = model(code);

  file.count(conditions, callback);
};

/**
 * 添加素材
 * @param {string} code 公司code
 * @param {object} newFile 素材
 * @param {function} callback 返回素材添加结果
 */
exports.add = function(code, newFile, callback) {

  var File = model(code);

  new File(newFile).save(function(err, result) {
    callback(err, result);
  });
};

/**
 * 更新指定素材
 * @param {string} code 公司code
 * @param {string} fileid 素材ID
 * @param {object} conditions 素材更新条件
 * @param {function} callback 返回素材更新结果
 */
exports.update = function(code, fileid, conditions, callback) {

  var file = model(code);

  file.findByIdAndUpdate(fileid, conditions, function(err, result) {
    callback(err, result);
  });
};

/**
 * 更新指定素材
 * @param {string} code 公司code
 * @param {string} fileid 素材ID
 * @param {object} conditions 素材更新条件
 * @param {function} callback 返回素材更新结果
 */
//TODO 和update方法重复,删除?
exports.replace = function(code, fileid, conditions, callback) {

  var file = model(code);

  file.findByIdAndUpdate(fileid, { $set: conditions }, function(err, result) {
    callback(err, result);
  });
};

/**
 * 获取指定素材
 * @param {string} code 公司code
 * @param {string} fileid 素材ID
 * @param {function} callback 返回指定素材
 */
exports.get = function(code, fileid, callback) {

  var file = model(code);

  file.findById(fileid, function(err, result) {
    callback(err, result);
  });
};


/**
 * 删除素材
 * @param {string} code 公司code
 * @param {string} fileid 素材ID
 * @param {function} callback 返回素材删除结果
 */
exports.remove = function(code, fileid, callback) {

  var file = model(code);

  file.findByIdAndRemove(fileid, function(err, result) {
    callback(err, result);
  });
};

/**
 * 获取素材一览
 * @param {string} code 公司code
 * @param {object} condition 条件
 * @param {number} start 数据开始位置
 * @param {number} limit 数据件数
 * @param {function} callback 返回素材一览
 */
exports.getList = function(code, condition, start, limit, callback) {

  var file = model(code);

  file.find(condition)
    .skip(start || 0)
    .limit(limit || 20)
    .sort({ editat: -1 })
    .exec(function(err, result) {
      callback(err, result);
    });
};

/**
 * 获取素材件数
 * @param {string} code 公司Code
 * @param {object} condition 条件
 * @param {function} callback 返回素材件数
 */
exports.total = function(code, condition, callback) {

  var file = model(code);

  file.count(condition).exec(function(err, count) {
    callback(err, count);
  });
};
