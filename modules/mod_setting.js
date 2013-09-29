var mongo = require('mongoose')
  , util = require('util')
  , conn = require('./connection')
  , schema = mongo.Schema;

var Setting = new schema({
  key : {type:String}
  , val : {type:String}
  , valid: {type: Number, default:1}
  , createat: {type: Date, description: "创建时间",default:new Date()}
  , createby: {type: String}
  , editat: {type: Date, description: "修改时间", default:new Date()}
  , editby: {type: String}
});

function model(code) {
  return conn(code).model('Setting', Setting);
}

exports.find = function(code_ , keys_ , callback_){
  var key = model(code_);
  key.find({"key":{ "$in" : keys_ } }).exec(function(err,result){
    callback_(err,result);
  })
};

// 添加设备情报
exports.add = function(code, item_, callback_){

  var dev =  model(code)
  model(code).findOne({key : item_.key },function(err,result){

    if(!result){
      new dev(item_).save(function(err, result){
        callback_(err, result);
      });
    }else{
      result.val = item_.val;
      result.editby = item_.editby;
      result.editat = new Date();
      result.save(callback_);
    }

  });

};

