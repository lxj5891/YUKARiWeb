var mongo = require('mongoose')
  , util = require('util')
  , conn = require('./connection')
  , schema = mongo.Schema;

var Device = new schema({

    companyid: {type: String}
  , companycode : {type:String,description:"公司CODE"}
  , deviceid: {type: String}
  , deviceType: {type:String}
  , devstatus : {type:String,description: "1:使用中 0:使用不可"}
  , userinfo: [{
      userid: {type:String,description: "使用者ID" }
    , username: {type:String}
    , status: {type:String,description: "1:使用中 0:使用不可 2:申请中 3:未注册用户申请中" }
//    , createat: { type: Date, default: Date.now }
//    , createby: {type: String}
//    , lastat: { type: Date, default: Date.now }
//    , lastby: {type: String}
  }]
  , description: {type:String, description: "申请描述"}
  , valid: {type: Number, default:1}
  , createat: {type: Date, description: "创建时间"}
  , createby: {type: String}
  , editat: {type: Date, description: "修改时间"}
  , editby: {type: String}
});

function model() {
  return conn().model('Device', Device);
}
// 获取设备有效件数
exports.total = function(callback_){
  var dev = model();
  dev.count({valid:1}).exec(function(err, count){
    callback_(err, count);
  });
};

// 获取设备情报一览
exports.list = function(condition_, start_, limit_, callback_){

  var dev = model();

  dev.find(condition_)
    .skip(start_ || 0)
    .limit(limit_ || 15)
    .sort({deviceid: 'desc'})
    .exec(function(err, result){
      callback_(err, result);
    });
};

// 添加设备情报
exports.add = function(dev_, callback_){

  var dev = model();

  new dev(dev_).save(function(err, result){
    callback_(err, result);
  });
};

exports.update = function(deviceid, dev_, callback_){

  var dev = model();

  dev.findByIdAndUpdate(deviceid, dev_, function(err, result){
    callback_(err, result);
  });
};

exports.allow = function(uid_, device_, user_, allow_, callback_){

  var dev = model();

  // 设备ID是唯一，所以不用加compid
  dev.update({"deviceid": device_, "userinfo.userid": user_}, {
      $set: {"userinfo.$.status": allow_ ? "1" : "0"}
      , editat: new Date()
      , editby: uid_
    }
    , function(err, result){
      callback_(err, result);
  });
};


// 检索设备
exports.find = function(condition_, callback_){

  var dev = model();

  dev.find(condition_).exec(function(err, result){
    callback_(err, result);
  });
};

//
exports.deviceTotalByComId = function(comid_, callback_) {
  var dev = model();
  dev.count({companyid:comid_,valid:1}).exec(function(err, count){
    console.log(count);
    callback_(err, count);
  });
};



