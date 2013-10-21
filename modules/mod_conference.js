var mongo = require('mongoose')
  , util = require('util')
  , conn = require('./connection')
  , schema = mongo.Schema;


var Conference = new schema({
  picture: {type: String, description:"照片"},
  comment: {type: String, description:"备注"},
  createat: { type: Date, default: Date.now },
  createby: {type: String},
  valid: {type: Number, default: 1}
});

function model(dbname) {
  return conn(dbname).model('Conference', Conference);
}

exports.add = function(code_, conference_, callback_){
  var conference = model(code_);
  new conference(conference_).save(function(err, result){
    callback_(err, result);
  });
};