var mongo = require('mongoose')
  , util = require('util')
  , conn = require('./connection')
  , schema = mongo.Schema;

var Notice = new schema({
    company: {type: String},
    title: {type: String},
    touser: [ String ],
    togroup: [ String ],
    notice: {type: String},
    createat: { type: Date, default: Date.now },
    createby: {type: String},
    valid: {type: Number, default:1}
});

function model() {
  return conn().model('Notice', Notice);
}

// get list
exports.list = function(condition_, start_, limit_, callback_){

  var notice = model();

  notice.find(condition_)
    .skip(start_ || 0)
    .limit(limit_ || 20)
    .sort({editat: -1})
    .exec(function(err, result){
      callback_(err, result);
    });
};

exports.add = function(notice_, callback_){

    var notice = model();

    new notice(notice_).save(function(err, result){
        callback_(err, result);
    });
};

exports.findOne = function(id,callback){
  var notice = model();
  notice.findOne({_id:id},function(err,docs){
    callback(err,docs);
  });
}
