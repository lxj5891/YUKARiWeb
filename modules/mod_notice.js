var mongo = require('mongoose')
  , util = require('util')
  , conn = require('./connection')
  , schema = mongo.Schema;

var Notice = new schema({
  title: {type: String},
  touser: [ String ],
  togroup: [ String ],
  notice: {type: String},
  createat: { type: Date, default: Date.now },
  createby: {type: String},
  valid: {type: Number, default:1}
});

function model(code) {
  return conn(code).model('Notice', Notice);
}

// get list
exports.list = function(code_, condition_, start_, limit_, callback_){
  var notice = model(code_);
  notice.find(condition_)
    .skip(start_ || 0)
    .limit(limit_ || 20)
    .sort({createat: -1})
    .exec(function(err, result){
      callback_(err, result);
    });
};

exports.add = function(code_, notice_, callback_){
  var notice = model(code_);
  new notice(notice_).save(function(err, result){
    callback_(err, result);
  });
};

exports.findOne = function(code_, id, callback){
  var notice = model(code_);
  notice.findOne({_id:id},function(err,docs){
    callback(err,docs);
  });
};

exports.total = function(code_, condition, callback_){
  var notice = model(code_);
  notice.count(condition).exec(function(err, count){
    callback_(err, count);
  });
};
