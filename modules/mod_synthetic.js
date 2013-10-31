/**
 * @file 存取元素的module
 * @author h_li@dreamarts.co.jp
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var mongoose = require("mongoose")
  , i18n    = require("i18n")
  , conn = require("./connection")
  , schema = mongoose.Schema;


/**
 * @type {schema} 元素schema
 */
var Synthetic = new schema({
  company   : { type: String, description: "公司" },
  comment   : { type: String, description: "描述" },
  subtype   : { type: String, description: "标识" },
  name      : { type: String, description: "名称" },
  type      : { type: String, description: "类别" },
  coverrows : { type: Number, description: "封面占九宫格的行数" },
  covercols : { type: Number, description: "封面占九宫格的列数" },
  cover     : [
    {
      material_id : { type: String, description: "素材ID" },
      type        : { type: String, description: "封面种类：视频，图片" }
    }
  ],  // 封面
  page      : { type: String, description: "页数" },
  metadata  : [
    {
      index         : { type: Number, description: "索引" },
      prefix        : { type: String, description: "前缀" }, // 未定
      material_id   : { type: String, description: "素材ID" },
      effect        : { type: String, description: "效果: none, zoomAndMoveRightDown, zoom, zoomOut, moveRightUp, up" },
      txtmaterial_id: { type: String, description: "透明的文字图片素材ID" },
      widget        : [
        {
          index       : { type: Number, description: "索引" },
          title       : { type: String, description: "描述" },
          name        : { type: String, description: "插件的名称" },
          widget_id   : { type: String, description: "对应前台的widget_id" },
          width       : { type: Number, description: "宽度" },
          height      : { type: Number, description: "高度" },
          top         : { type: Number, description: "top位置" },
          left        : { type: Number, description: "left位置" },
          background  : { type: Number, description: "Widget的背景  不需要背景" },
          effect      : { type: String, description: "效果" },
          action      : {
            type  : { type: String, description: "动作类型" },
            value : { type: String, description: "动作值" },
            tags  : [
              {
                tag     : { type: String, description: "分类" },
                subtag  : { type: String, description: "子分类" }
              }
            ],
            bg_material_id: { type: String, description: "Introduction 背景图片" },
            material_id   : { type: String, description: "素材ID " },
            urlScheme     : { type: String, description: "app启动urlScheme：仅app启动类型" },
            downloadURL   : { type: String, description: "app启动下载URL：仅app启动类型" }
          },
          metadata_id : { type: String, description: "对应前台的metadata_id" },
          page        : { type: String, description: "page" }
        }
      ]
    }
  ],
  valid     : { type: Number, description: "0:无效 1:有效", default: 0 },
  editat    : { type: Date, description: "修改时间", default: Date.now },
  editby    : { type: String, description: "修改者" },
  createat  : { type: Date, description: "创建时间", default: Date.now },
  createby  : { type: String, description: "创建者" }
});



/**
 * 使用定义好的Schema，生成Synthetic的model
 * @returns {*} synthetic model
 */

function model(code) {
  return conn(code).model("Synthetic", Synthetic);
}

/**
 * 获得元素的个数
 * @param condition 条件
 * @param callback 获得元素的个数 (err,count)
 */

exports.count = function (code, condition, callback) {

  model(code).count(condition, callback);

};

/**
 * 获取元素一览
 * @param condition 条件
 * @param start 数据开始位置
 * @param limit 数据件数
 * @param callback 获取元素一览
 */

exports.getList = function (code, condition, start, limit, callback) {

  var synthetic = model(code);

  synthetic.find(condition)
    .skip(start || 0)
    .limit(limit || 20)
    .sort({editat: -1})
    .exec(function (err, result) {
      callback(err, result);
    });
};

/**
 * 获得元素的个数
 * @param condition 条件
 * @param callback 获得元素的个数 (err,count)
 */

exports.total = function (code, condition, callback) {

  var synthetic = model(code);

  synthetic.count(condition).exec(function (err, count) {
    callback(err, count);
  });
};

/**
 * 获得元素的逻辑删除
 * @param code  公司CODE
 * @param uid   用户uid
 * @param id    元素id
 * @param callback 返回结果
 */

exports.remove = function (code, uid, id, callback) {

  var synthetic = model(code);

  synthetic.findByIdAndUpdate(id, {
    valid: 0,
    editat: new Date(),
    editby: uid
  }, function (err, result) {
    callback(err, result);
  });

};

/**
 * 复制一条 元素的数据
 * @param code  公司CODE
 * @param uid   用户uid
 * @param id    元素id
 * @param callback 返回结果
 */

exports.copy = function (code, uid, id, callback) {

  var synthetic = model(code);

  synthetic.findById(id, function (err, result) {

    var newdata = result._doc;
    delete newdata._id;
    newdata.createat = new Date();
    newdata.createby = uid;
    newdata.editat = new Date();
    newdata.editby = uid;
    newdata.name = newdata.name + i18n.__("js.mod.copy.title");

    synthetic.create(newdata, function (err, result) {
      callback(err, result);
    });
  });
};


/**
 * 新规元素
 * @param code  公司CODE
 * @param type  元素类型
 * @param user  新规用户信息
 * @param callback 返回结果
 */

exports.add = function (code, type, user, callback) {

  var obj = {
    type: type,
    company: user.companyid,
    page: 0,
    editat: new Date(),
    editby: user._id,
    createat: new Date(),
    createby: user._id
  };

  model(code)(obj).save(function (err, result) {
    callback(err, result);
  });

};

/**
 * 修改元素
 * @param code  公司CODE
 * @param id  元素的id
 * @param synthetic  元素的信息
 * @param userid  用户id
 * @param callback 返回结果
 */

exports.update = function (code, id, synthetic, userid, callback) {

  model(code).findById(id, function (err, docs) {
    if (synthetic.cover) {
      docs.cover = synthetic.cover;
    }

    if (synthetic.metadata) {
      docs.metadata = synthetic.metadata;
      docs.page = synthetic.metadata.length;
    }
    if (synthetic.comment) {
      docs.comment = synthetic.comment;
    }

    if (synthetic.name) {
      docs.name = synthetic.name;
    }

    if (synthetic.coverrows) {
      docs.coverrows = synthetic.coverrows;
    }

    if (synthetic.covercols) {
      docs.covercols = synthetic.covercols;
    }

    if (synthetic.syntheticSign) {
      docs.subtype = synthetic.syntheticSign;
    }

    if(synthetic.opts){
      docs.opts = synthetic.opts;
    }

    docs.valid = 1;
    docs.editat = new Date();
    docs.editby = userid;
    docs.save(callback);

  });

};


/**
 * 通过元素id 获得元素的信息
 * @param code  公司CODE
 * @param id  元素的id
 * @param callback 返回结果
 */


exports.get = function (code, id, callback) {

  var Synthetic = model(code);
  Synthetic.findById(id, function (err, docs) {
    callback(err, docs);
  });

};
