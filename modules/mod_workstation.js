/**
 * @file 存取工作站
 * @author Sara(fyx1014@hotmail.com)
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var mongo  = require("mongoose")
  , conn    = require("./connection")
  , schema  = mongo.Schema;

/**
 * @type {schema} workstation schema
 */
var Workstation = new schema({
    title     : { type: String, description: "标题"}
  , type      : { type: String, description: "链接类型： ise（INSUITE），sdb（SmartDB），web，app"}
  , url       : { type: String, description: "链接"}
  , icon      : { type: String, description: "图标：1~15"}
  , open      : { type: Number, description: "公开：0（open）,1（not open）"}
  , touser    : [ String ]
  , togroup   : [ String ]
  , sort_level: { type: Number, default: 1, description: "顺序"}
  , editat    : { type: Date, default: Date.now, description: "修改时间"}
  , editby    : { type: String, description: "修改者"}
  , createat  : { type: Date, default: Date.now, description: "创建时间" }
  , createby  : { type: String, description: "创建者"}
  , valid      : { type: Number, default: 1, description: "有效性: 0(无效), 1(有效)"}
  });

/**
 * 使用定义好的Schema,通过公司Code处理工作站数据
 * @param {string} dbname
 * @returns {model} workstation model
 */
function model(dbname) {

  return conn(dbname).model("Workstation", Workstation);
}

/**
 * 获取指定素材
 * @param {string} code 公司code
 * @param {string} workstationId 工作站ID
 * @param {function} callback 返回指定工作站
 */
exports.get = function(code, workstationId, callback) {

  var workstation = model(code);

  workstation.findOne({valid: 1, _id: workstationId}, function(err, result) {
    callback(err, result);
  });
};

/**
 * 追加工作站
 * @param {string} code 公司code
 * @param {object} newWorkstation 工作站
 * @param {function} callback 返回追加结果
 */
exports.add = function(code, newWorkstation, callback) {

  var Workstation = model(code);

  new Workstation(newWorkstation).save(function(err, result) {
    callback(err, result);
  });
};

/**
 * 更新指定工作站
 * @param {string} code 公司code
 * @param {string} workstationId 工作站ID
 * @param {object} newWorkstation 更新工作站的内容
 * @param {function} callback 返回更新结果
 */
exports.update = function(code, workstationId, newWorkstation, callback) {

  var workstation = model(code);

  workstation.findByIdAndUpdate(workstationId, newWorkstation, function(err, result) {
    callback(err, result);
  });
};

/**
 * 删除工作站
 * @param {string} code 公司code
 * @param {string} uid  更新者ID
 * @param {string} workstationId 工作站ID
 * @param {function} callback 返回删除结果
 */
exports.remove = function (code, uid, workstationId, callback) {

  var workstation = model(code);

  workstation.findByIdAndUpdate(workstationId, {valid: 0, editat: new Date(), editby: uid}, function(err, result) {
    callback(err, result);
  });
};

/**
 * 获取工作站一览
 * @param {string} code 公司code
 * @param {object} condition 条件
 * @param {function} callback 返回工作站一览
 */
exports.getList = function(code, condition, callback) {

  var workstation = model(code);

  workstation.find(condition)
    .sort({sort_level: 1})
    .exec(function(err, result) {
      callback(err, result);
    });
};

/**
 * 获取工作站件数
 * @param {string} code 公司Code
 * @param {object} condition 条件
 * @param {function} callback 返回工作站件数
 */
exports.total = function(code, condition, callback) {

  var workstation = model(code);

  workstation.count(condition).exec(function(err, count) {
    callback(err, count);
  });
};