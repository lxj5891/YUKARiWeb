var mongo = require('mongoose')
  , util = require('util')
  , conn = require('./connection')
  , schema = mongo.Schema;

/**
 * Layout
 * @type {schema}
 */

var Layout = new schema({
  company: {type: String, description: ""},
  layout: {
      name: {type: String, description: "名前"},
      comment: {type: String, description: "说明"},
      image: {
        imageH: {type:String, description:"横向全画面イメージ"},
        imageV: {type:String, description:"竖向"}
      },
      page:[{
          image: {type:String, description:"全画面イメージ"},
          type: {type:Number, description:"1:横 2:縦"},
          tile: [{
              num: {type:Number},
              rowspan: {type:Number, description:"行数"},
              colspan: {type:Number, description:"列数"},
              syntheticId: {type:String, description:"ネタID"}
          }]
      }]
  },
  status: {type:Number, description:"1:未申請 2:申請中 3:否認 4:承認済み"},
  publish: {type:Number, description:"1:未申請 2:申請中 3:否認 4:承認済み"},
  confirmby: {type:String, description:"承認者"},
  confirmat: {type: Date, description: "承認時間"},
  editat: {type: Date, default: Date.now},
  editby: {type: String},
  createat: { type: Date, default: Date.now },
  createby: {type: String},
  valid: {type: Number, default: 1}
});

function model(dbname) {
  return conn(dbname).model('Layout', Layout);
}
exports.count = function(code, query,callback){
  model(code).count(query,callback);
}
// 添加
exports.add = function(code, layout_, callback_){

  var layout = model(code);

  new layout(layout_).save(function(err, result){
    callback_(err, result);
  });
};

exports.update = function (code, layoutId_, layout_, callback_) {
  var layout = model(code);
//  layout.findOneAndUpdate(condition_, layout_, function(err, result){
//    callback_(err, result);
//  });
  layout.findByIdAndUpdate(layoutId_, layout_, function(err, result){
    callback_(err, result);
  });
};

exports.get = function (code, condition_,callback_){
  var layout = model(code);
  layout.findOne(condition_,function(err,result){
    callback_(err, result);
  });
};


// DELETE
exports.remove = function (code, uid_, id_, callback_) {

    var layout = model(code);

    layout.findByIdAndUpdate(id_, {valid: 0, editat: new Date, editby: uid_}, function(err, result){
        callback_(err, result);
    });
};

// COPY
exports.copy = function (code, uid_, id_, callback_) {

    var layout = model(code);

    layout.findById(id_, function(err, result) {

        var newdata = result._doc;
        delete newdata._id;
        newdata.createat = new Date();
        newdata.createby = uid_;
        newdata.editat = new Date();
        newdata.editby = uid_;
        newdata.name = newdata.name + __("js.mod.copy.title");

        layout.create(newdata, function(err, result){
            callback_(err, result);
        });
    });
};

//////////////////////////////////////////////////
// 获取一览
exports.list = function(code, condition_, start_, limit_, callback_){

  var layout = model(code);

  layout.find(condition_)
    .skip(start_ || 0)
    .limit(limit_ || 20)
    .sort({editat: -1})
    .exec(function(err, result){
      callback_(err, result);
    });
};

// 获取件数
exports.total = function(code, condition, callback_){
  var layout = model(code);

  layout.count(condition).exec(function(err, count){
    callback_(err, count);
  });
};