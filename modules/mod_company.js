/**
 * @file 存取公司信息的module
 * @author r2space@gmail.com
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

var mongo       = require("mongoose")
  , smart       = require("smartcore").core.util
  , conn        = require("./connection")
  , schema      = mongo.Schema;

/**
 * @type {schema} 公司schema
 */
var Company = new schema({
    code        : {type: String, description: "公司CODE"}
  , path        : {type: String, description: "登陆url用的path，对应顾客编集画面的公司ID"}
  , companyType : {type: String, description: "0:提案客户 1:委托客户 2:自营客户"}
  , mail        : {type: String, description: "管理员ID"}
  , name        : {type: String, description: "名称"}
  , kana        : {type: String, description: "假名"}
  , address     : {type: String, description: "地址"}
  , tel         : {type: String, description: "电话"}
  , active      : {type: Number, description: "0:无效 1:有效"}
  , valid       : {type: Number, description: "删除 0:无效 1:有效", default:1}
  , createat    : {type: Date,   description: "创建时间"}
  , createby    : {type: String, description: "创建者"}
  , editat      : {type: Date,   description: "最终修改时间"}
  , editby      : {type: String, description: "最终修改者"}
});

/**
 * 获取公司一览
 * @param condition_ 条件
 * @param start_ 数据开始位置
 * @param limit_ 数据件数
 * @param callback_ 返回公司一览
 */
exports.getList = function(condition_, start_, limit_, callback_){

  var comp = model();

  comp.find(condition_)
    .skip(start_ || 0)
    .limit(limit_ || 20)
    .sort({ editat: "desc" })
    .exec(function(err, result) {
      return callback_(err, result);
    });
};

/**
 * 通过公司ID获取一个公司
 * @param path_
 * @param callback_
 */
exports.getByPath = function(path_, callback_) {

  var comp = model();

  comp.findOne({ path: path_ }, function(err, result) {
    return callback_(err, result);
  });
};

/**
 * 通过公司Code获取一个公司
 * @param code_
 * @param callback_
 */
exports.getByCode = function(code_, callback_) {

  var comp = model();

  comp.findOne({ code: code_ }, function(err, result) {
    return callback_(err, result);
  });
};

/**
 * 获取指定公司
 * @param compid_
 * @param callback_
 */
exports.get = function(compid_, callback_) {

  var comp = model();

  comp.findById(compid_, function(err, result) {
    return callback_(err, result);
  });
};

/**
 * 添加公司
 * @param comp_
 * @param callback_
 */
exports.add = function(comp_, callback_){

  createCode(function(err, code) {
    if (err) {
      return callback_(err);
    }

    var comp = model();
    comp_.code = code;

    new comp(comp_).save(function(err, result){
      return callback_(err, result);
    });
  });
};

/**
 * 更新指定公司
 * @param compid_
 * @param comp_
 * @param callback_
 */
exports.update = function(compid_, comp_, callback_) {

  // 当code存在
  if (comp_.code) {
    var comp = model();

    comp.findByIdAndUpdate(compid_, comp_, function(err, result) {
      return callback_(err, result);
    });
  }

  // 不存在Code里，追加生成一个 ---- 旧数据的修复。
  else {
    createCode(function(err, code){
      if (err) {
        return callback_(err);
      }

      comp_.code = code;
      exports.update(compid_, comp_, callback_);
    });
  }
};

/**
 * 获取公司有效件数
 * @param condition_
 * @param callback_
 */
exports.total = function(condition_, callback_) {

  var comp = model();

  condition_.valid = 1;
  comp.count(condition_).exec(function(err, count) {
    return callback_(err, count);
  });
};

/**
 * 取得唯一的Code
 * @param callback_
 */
function createCode(callback_) {

  var comp = model()
  , guid8 = smart.randomGUID8();

  comp.count({ code: guid8 }).exec(function(err, count) {
    if (err) {
      return callback_(err);
    }

    if (count > 0) {
      createCode(comp_, callback_);
    } else {
      return callback_(err, guid8);
    }
  });
}

/**
 * 使用定义好的Schema，生成Company的model
 * @returns {*} company model
 */
function model() {

  return conn().model("Company", Company);
}
