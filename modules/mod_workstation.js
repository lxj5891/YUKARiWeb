var mongo = require('mongoose')
  , util = require('util')
  , conn = require('./connection')
  , schema = mongo.Schema;


var Workstation = new schema({
  menu:[{
    title: {type: String, description: "title"}
    , type: {type: String, description: "类型"}
    , url: {type: String, description: "url"}
    , icon: {type: String, description: "icon"}
    , open: {type: String, description: "1:open,0:not open"}
    , open_permission: [String]
  }],
  editat: {type: Date, default: Date.now},
  editby: {type: String},
  createat: { type: Date, default: Date.now },
  createby: {type: String},
  valid: {type: Number, default: 1}
});

function model(dbname) {
  return conn(dbname).model('Workstation', Workstation);
}

var add = function(code_, workstation_, callback_){
  var workstation = model(code_);
  new workstation(workstation_).save(function(err, result){
    callback_(err, result);
  });
};

var update = function (code_, workstationId_, workstation_, callback_){
  var workstation = model(code_);
  workstation.findByIdAndUpdate(workstationId_, workstation_, function(err, result){
    callback_(err, result);
  });
};

exports.one = function(code_, callback_){
  var workstation = model(code_);
  workstation.findOne({valid:1},function(err, result){
    callback_(err, result);
  });
};

exports.save = function(code_,workstation_, callback_){
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
};