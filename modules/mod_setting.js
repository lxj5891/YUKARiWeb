var mongo = require('mongoose')
  , util = require('util')
  , conn = require('./connection')
  , schema = mongo.Schema;

var Setting = new schema({
    kye : {type:String}
  , val : {type:String}
  , valid: {type: Number, default:1}
  , createat: {type: Date, description: "创建时间"}
  , createby: {type: String}
  , editat: {type: Date, description: "修改时间"}
  , editby: {type: String}
});

function model(code) {
  return conn(code).model('Setting', Device);
}

// 添加设备情报
exports.add = function(code, item_, callback_){

  var dev = model(code);
  new dev(item_).save(function(err, result){
    callback_(err, result);
  });
};

