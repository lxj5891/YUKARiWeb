/**
 * Company:
 * Copyright (c) 2013 Author Name li
 */

var mongo = require('mongoose')
  , util = require('util')
  , conn = require('./connection')
  , schema = mongo.Schema;

var Company = new schema({
    code : {type: String ,description:"公司CODE"}
  , companyType: {type: String,description: "0:demo 1:正式客户"}
  , mail: {type: String,description: "管理员ID"}
  , name: {type: String}
  , kana: {type: String}
  , address: {type: String}
  , tel: {type: String}
  , active: {type: Number, description: "0:无效 1:有效"}
  , valid: {type: Number, default:1, description: "0:无效 1:有效"}
  , createat: {type: Date, description: "创建时间"}
  , createby: {type: String}
  , editat: {type: Date, description: "修改时间"}
  , editby: {type: String}
});

function model() {
  return conn().model('Company', Company);
}

// 获取公司一览
exports.list = function(condition_, start_, limit_, callback_){

    var comp = model();

    comp.find(condition_)
        .skip(start_ || 0)
        .limit(limit_ || 20)
        .sort({editat: 'desc'})
        .exec(function(err, result){
            callback_(err, result);
        });
};
// 获取指定公司
exports.find = function(query,callback_){

  var comp = model();

  comp.find(query, function(err, result){
    callback_(err, result);
  });
};
// 获取指定公司
exports.searchOne = function(compid,callback_){

    var comp = model();

    comp.findById(compid, function(err, result){
        callback_(err, result);
    });
};
// 添加公司
exports.add = function(comp_, callback_){

  var comp = model();

  new comp(comp_).save(function(err, result){
    callback_(err, result);
  });
};

// 更新指定公司
exports.update = function(compid, comp_, callback_){

  var comp = model();

  comp.findByIdAndUpdate(compid, comp_, function(err, result){
    callback_(err, result);
  });
};

// 获取公司有效件数
exports.total = function(callback_){
    var comp = model();
    comp.count({valid:1}).exec(function(err, count){
        callback_(err, count);
    });
};