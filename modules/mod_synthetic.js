var mongo = require('mongoose')
  , util = require('util')
  , conn = require('./connection')
  , schema = mongo.Schema;

/**
 * 元素
 * @type {schema}
 */

var Synthetic = new schema({
  company: {type: String, description: ""},
  comment: {type: String, description: "描述"},
  subtype: {type: String, description: "标识"},
  name: {type: String, description: "名称"},
  type: { type: String, description: "类别"},
  coverrows: {type: Number, description: "封面占九宫格的行数"},
  covercols: {type: Number, description: "封面占九宫格的列数"},
  cover: [
    {
      material_id: {type: String, description: "素材ID"}, type: {type: String, description: "封面种类：视频，图片"}
    }
  ],  // 封面
  page: {type: String, description: "页数"},
  metadata: [
    {
      index: {type: Number, description: "索引"},
      prefix: {type: String, description: "前缀"}, // 未定
      material_id: {type: String, description: "素材ID"},
      effect: {type: String, description: "效果: none, zoomAndMoveRightDown, zoom, zoomOut, moveRightUp, up}"},
      txtmaterial_id: {type: String, description: "透明的文字图片素材ID"},
      widget: [
        {
          index: {type: Number, description: "索引"},
          title: {type: String, description: "描述"},
          name: {type: String, description: "插件的名称"},
          widget_id: {type: String, description: "对应前台的widget_id"},
          width: {type: Number},
          height: {type: Number},
          top: {type: Number},
          left: {type: Number},
          background: {type: Number, description: "Widget的背景  不需要背景"},
          effect: {type: String, description: "效果"},
          action: {
            type: {type: String, description: "动作类型"},
            value: {type: String, description: "动作类型"},
            tags: [
              {
                tag: {type: String, description: "分类"},
                subtag: {type: String, description: "子分类"}
              }
            ],
            bg_material_id: {type: String, description: "Introduction 背景图片"},
            material_id: {type: String, description: "素材ID "},
            urlScheme: {type: String, description: "app启动urlScheme：仅app启动类型"},
            downloadURL: {type: String, description: "app启动下载URL：仅app启动类型"}
          },
          metadata_id: {type: String, description: "对应前台的metadata_id"},
          page: {type: String, description: "page"}
        }
      ]
    }
  ],
  valid: {type: Number, default: 0, description: "0:无效 1:有效"},
  editat: {type: Date, default: Date.now, description: "修改时间"},
  editby: {type: String},
  createat: { type: Date, default: Date.now },
  createby: {type: String}
});

function model(code) {
  return conn(code).model('Synthetic', Synthetic);
}
exports.count = function (code, query, callback) {
  model(code).count(query, callback);
}
// 获取一览
exports.list = function (code, condition_, start_, limit_, callback_) {

  var synthetic = model(code);

  synthetic.find(condition_)
    .skip(start_ || 0)
    .limit(limit_ || 20)
    .sort({editat: -1})
    .exec(function (err, result) {
      callback_(err, result);
    });
};

// 获取件数
exports.total = function (code, condition, callback_) {

  var synthetic = model(code);

  synthetic.count(condition).exec(function (err, count) {
    callback_(err, count);
  });
};

// 逻辑删除
exports.remove = function (code, uid_, id_, callback_) {

  var synthetic = model(code);

  synthetic.findByIdAndUpdate(id_, {valid: 0, editat: new Date, editby: uid_}, function (err, result) {
    callback_(err, result);
  });
};

// 复制一条数据
exports.copy = function (code, uid_, id_, callback_) {

  var synthetic = model(code);

  synthetic.findById(id_, function (err, result) {

    var newdata = result._doc;
    delete newdata._id;
    newdata.createat = new Date();
    newdata.createby = uid_;
    newdata.editat = new Date();
    newdata.editby = uid_;
    newdata.name = newdata.name + __("js.mod.copy.title");

    synthetic.create(newdata, function (err, result) {
      callback_(err, result);
    });
  });
};

exports.saveAndNew = function (code, synthetic_, callback_) {

  var synthetic = model(code);
  new synthetic(synthetic_).save(function (err, result) {

    callback_(err, result);
  });
};
function createSynthetic(code, type,user, callback_) {
  var synthetic = model(code);
  var obj = {
    type: type, company: user.companyid, page: 0, editat: new Date(), editby: user._id, createat: new Date(), createby: user._id
  }
  new synthetic(obj).save(function (err, result) {
    callback_(err, result);
  });
};
function updateSynthetic(code, id,synthetic_,uid,callback_){
  var synthetic = model(code);
  synthetic.findOne({_id: id}, function (err, docs) {
    if (synthetic_.cover)
      docs.cover = synthetic_.cover;
    if (synthetic_.metadata) {
      docs.metadata = synthetic_.metadata;
      docs.page = synthetic_.metadata.length;
    }
    if (synthetic_.comment)
      docs.comment = synthetic_.comment;
    if (synthetic_.name)
      docs.name = synthetic_.name;

    if (synthetic_.coverrows)
      docs.coverrows = synthetic_.coverrows;
    if (synthetic_.covercols)
      docs.covercols = synthetic_.covercols;
    if (synthetic_.syntheticName)
      docs.name = synthetic_.syntheticName;
    if (synthetic_.syntheticComment)
      docs.comment = synthetic_.syntheticComment;
    if (synthetic_.syntheticSign)
      docs.subtype = synthetic_.syntheticSign;

    docs.valid = 1;
    docs.editat = new Date();
    docs.editby = uid;
    docs.save(callback_);
  });

};
exports.update = function (code, id, synthetic_, user, callback_) {

  if(id.length<20){
    var type = id;
    createSynthetic(code, type,user,function(err,docs){
      updateSynthetic(code, docs._id, synthetic_, user._id, callback_);
    });
  } else {
    updateSynthetic(code, id, synthetic_, user._id, callback_);
  }
};

exports.findOne = function (code, id, callback) {
  var synthetic = model(code);
  synthetic.findOne({_id: id}, function (err, docs) {
    callback(err, docs);
  });
}
