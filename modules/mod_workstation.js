var mongo = require('mongoose')
  , util = require('util')
  , conn = require('./connection')
  , schema = mongo.Schema;


var Workstation = new schema({
  title: {type: String, description: "title"},
  type: {type: String, description: "类型"},
  url: {type: String, description: "url"},
  icon: {type: String, description: "icon"},
  open: {type: Number, description: "0:open,1:not open"},
  opento: [String],      //公開先
  sort_level: {type:Number, default: 1}, //ソートレベル
  editat: {type: Date, default: Date.now},
  editby: {type: String},
  createat: { type: Date, default: Date.now },
  createby: {type: String},
  valid: {type: Number, default: 1}
});

function model(dbname) {
  return conn(dbname).model('Workstation', Workstation);
}

exports.add = function(code_, workstation_, callback_){
  var workstation = model(code_);

  new workstation(workstation_).save(function(err, result){
    callback_(err, result);
  });
};

exports.update = function (code_, workstationId_, workstation_, callback_){
  var workstation = model(code_);
  workstation.findByIdAndUpdate(workstationId_, workstation_, function(err, result){
    callback_(err, result);
  });
};

exports.one = function(code_, workstationId_, callback_){
  var workstation = model(code_);

  workstation.findOne({valid:1, _id:workstationId_},function(err, result){
    callback_(err, result);
  });
};

/*exports.save = function(code_, workstation_, callback_){
  exports.one(code_, function(err,ws){
    if(err){
      return callback_(err);
    }

    if(ws){
      update(code_, ws._id, workstation_,function(err, result){
        callback_(err, result);
      });
    } else {
      add(code_, workstation_,function(err, result){
        callback_(err, result);
      });
    }
  });
}; */

exports.remove = function (code_, uid_, workstationId_, callback_) {
  var workstation = model(code_);

  workstation.findByIdAndUpdate(workstationId_, {valid: 0, editat: new Date, editby: uid_}, function(err, result){
    callback_(err, result);
  });
};

exports.list = function(code_, condition_, callback_){
  var workstation = model(code_);

  workstation.find(condition_)
    .sort({sort_level: 1})
    .exec(function(err, result){
      callback_(err, result);
    });
};