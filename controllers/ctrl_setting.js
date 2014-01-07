var async   = smart.util.async
  , setting = require('../modules/mod_setting.js')
  , log     = smart.framework.log
  , _       = smart.util.underscore;

exports.getAppimage = function (handler, callback_) {
  var code=handler.code;
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

function saveSettingItem(code, user,item_list, callback_) {
  if (!code) {
    log.error("argument  error",user);
    return;
  }
  if (!item_list || item_list.length === 0) {
    log.error("argument  error",user);
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

exports.updateAppimage = function (handler, callback_) {
   var image1_ =handler.req.body.image1
   , image2_ =handler.req.body.image2
   , logo_ =handler.req.body.logo
   , code_ =handler.code
   , user_ =handler.req.session.user;
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

  saveSettingItem(code_,user_, list, callback_);


};