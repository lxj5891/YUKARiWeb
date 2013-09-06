var _         = require('underscore')
  , tag       = require('../modules/mod_tag.js')
  , async     = require('async');

/**
 * 给tag进行分类（如素材的tag，组的tag等），暂时没有使用
 * @type {string}
 */
var default_scope = "default";

exports.add = function (company_, uid_, name_, callback_) {

  var tags = _.isArray(name_) ? name_ : [name_];

  async.forEach(tags, function(data, cb){

    var object = {
      company: company_
      , uid: uid_
      , scope: default_scope
      , name: data
    }

    tag.add(object, function(err, result){
      cb(err, result);
    });

  }, function (err) {
    callback_(err);
  });

}

exports.remove = function (company_, uid_, name_, callback_) {

  var tags = _.isArray(name_) ? name_ : [name_];

  async.forEach(tags, function(data, cb){

    var object = {
      company: company_
      , uid: uid_
      , scope: default_scope
      , name: data
    }

    tag.remove(object, function(err, result){
      cb(err, result);
    });

  }, function (err) {
    callback_(err);
  });
}

exports.search = function(company_, keywords_, start_, limit_, callback_){

  var object = {
      company: company_
    , scope: default_scope
  };

  if (keywords_) {
    object.name = new RegExp("^" + keywords_.toLowerCase() + ".*$", "i");
  }

  tag.list(object, start_, limit_, function(err, result){
    callback_(err, result);
  });
}