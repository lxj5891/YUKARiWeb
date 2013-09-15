var mongo = require('mongoose')
  , util = require('util')
  , conn = require('./connection')
  , schema = mongo.Schema;

/**
 * 素材集合
 * @type {schema}
 */
var Tag = new schema({
    scope :{type: String, description: "Tag的有效范围"}
  , name: {type: String, description: "Tag名称"}
  , counter: { type: Number, description: "使用次数"}
  , valid: {type: Number, default:1, description: "0:无效 1:有效"}
  , editat: {type: Date, default: Date.now, description: "修改时间"}
  , editby: {type: String}
  , createat: { type: Date, default: Date.now }
  , createby: {type: String}
});

function model(code_) {
  return conn(code_).model('Tag', Tag);
}

// 添加一个tag（计数器加一）
exports.add = function (code_, tag_, callback_) {

  var tag = model(code_);
  var condition = {name: tag_.name};

  // 用名称检索，如有则计数器加一，否则新建
  tag.findOne(condition, function(err, docs){

    // increment
    if (docs) {
      tag.update(condition, {$inc: {counter: 1}}, function(err, result) {
        callback_(err, result);
      });
    }

    // add
    else {
      var object = {
          scope: tag_.scope
        , name: tag_.name
        , counter: 1
        , valid: 1
        , editat: new Date()
        , editby: tag_.uid
        , createat:  new Date()
        , createby: tag_.uid
      };

      new tag(object).save(function (err, result) {
        callback_(err, result);
      });
    }
  });
};

// 删除一个tag（计数器减一）
exports.remove = function (code_, tag_, callback_) {

  var tag = model(code_);
  var condition = {
      scope: tag_.scope
    , name: tag_.name
  };

  tag.findOne(condition, function(err, docs){

    // increment
    if (docs && docs.counter > 0) {
      tag.update(condition, {$inc: {counter: -1}}, function(err, result) {
        callback_(err, result);
      });
    } else {
      callback_(err, docs);
    }
  });
};

// 获取一览
exports.list = function(code_, condition_, start_, limit_, callback_){

  var tag = model(code_);

  tag.find(condition_)
    .skip(start_ || 0)
    .limit(limit_ || 20)
    .sort({counter: -1})
    .exec(function(err, result){

      callback_(err, result);
    });
};
