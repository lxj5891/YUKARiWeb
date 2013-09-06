/**
 * Material:
 * Copyright (c) 2013 Author Name kita
 */

var mongo = require('mongoose')
  , util = require('util')
  , conn = require('./connection')
  , schema = mongo.Schema;

/**
 * Material Schema
 * 文件实体存放到GridFS中，此处存储文件情报（部分信息和GridFS冗余）
 * 由于GridFS无法进行update，所以此处也负责维护文件的历史情报
 */

var Material = new schema({
  company: {type: String, description: ""},
  fileid: {type: String, description: "GridFSのID"},
  thumb: {
    big: {type: String},
    middle: {type: String},
    small: {type: String}
  },
  filename: {type: String},
  editat: {type: Date, description: "更新時間"},
  editby: {type: String},
  chunkSize: {type: Number},
  contentType: {type: String},
  length: {type: Number},
  tags: [String]
});

function model() {
  return conn().model('Material', Material);
}
exports.count = function(query,callback){
  var file = model();
  file.count(query,callback);
}
// 添加
exports.save = function(file_, callback_){

  var file = model();

  new file(file_).save(function(err, result){
    callback_(err, result);
  });
};

// 更新
exports.update = function(fileid_, update_, callback_){

  var file = model();
  file.findByIdAndUpdate(fileid_, update_, function(err, result){
    callback_(err, result);
  });
};

// 替换更新
exports.replace = function(fileid_, update_, callback_){

  var file = model();
  file.findByIdAndUpdate(fileid_, {$set: update_}, function(err, result){
    callback_(err, result);
  });
};

// 用ID取值
exports.get = function(fileid_, callback_){

  var file = model();
  file.findById(fileid_, function(err, result){
    callback_(err, result);
  });
};


// 删除
exports.remove = function(fileid_, callback_){

  var file = model();

  file.findByIdAndRemove(fileid_, function(err, result){
    callback_(err, result);
  });
}

// 获取一览
exports.list = function(condition_, start_, limit_, callback_){

  var file = model();

  file.find(condition_)
    .skip(start_ || 0)
    .limit(limit_ || 20)
    .sort({editat: -1})
    .exec(function(err, result){
      callback_(err, result);
    });
};

// 获取件数
exports.total = function(condition_, callback_){
  var file = model();
  file.count(condition_).exec(function(err, count){
    callback_(err, count);
  });
};
