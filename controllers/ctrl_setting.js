var async   = require('async')
  , setting = require('../modules/mod_setting.js')
  , log     = require("smartcore").core.log
  , _       = require('underscore');

exports.getAppimage = function (code, callback_) {
  var keys = ["image1", "image2", "imagelogo"];
  setting.getListByKeys(code, keys, callback_);
};

function settingItem(user_, key, val) {
  return {
    key: key,
    val: val,
    createby: user_._id,
    editby: user_._id
  };
};

function saveSettingItem(code, item_list, callback_) {
  if (!code) {
    log.out("error", "argument  error");
    return;
  }
  if (!item_list || item_list.length === 0) {
    log.out("error", "argument  error");
    return;
  }
  var task = [];

  for (var i in item_list) {
    var item = item_list[i];
    var fn = function (cb) {
      setting.add(code, this.item, function (err, result) {
        cb(err, result);
      });
    };
    fn = _.bind(fn, {item: item});
    task.push(fn);
  }

  async.series(task, function (err, result) {
    return callback_(err, result);
  });

};

exports.updateAppimage = function (code_, user_, image1_, image2_, logo_, callback_) {
  var list = [];
  if (image1_) {
    list.push(settingItem(user_, "image1", image1_));
  }
  if (image2_) {
    list.push(settingItem(user_, "image2", image2_));
  }
  if (logo_) {
    list.push(settingItem(user_, "imagelogo", logo_));
  }

  saveSettingItem(code_, list, callback_);


};