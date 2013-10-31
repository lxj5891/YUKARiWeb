var mongo = require('mongoose')
  , util = require('util')
  , conn = require('./connection')
  , schema = mongo.Schema;

/**
 * 公开中的Layout
 * @type {schema}
 */
var PublishLayout = new schema({
  company   : { type: String, description: "公司" },
  layoutId  : { type: String, description: "布局Id" },
  valid     : { type: Number, description: "有效", default: 1 },
  active    : {
    version     : { type: Number, description: "版本" },
    confirmat   : { type: Date, description: "承认时间" },
    confirmby   : { type: String, description: "承認者" },
    viewerUsers : [
      { type: String, description: "公開先User" }
    ],
    viewerGroups: [
      { type: String, description: "公開先Group" }
    ],
    openStart   : { type: Date, description: "公開开始" },
    openEnd     : { type: Date, description: "公開终止" },
    editat      : { type: Date, description: "更新時間", default: Date.now },
    editby      : { type: String, description: "更新時間" },
    createat    : { type: Date, description: "创建时间", default: Date.now },
    createby    : { type: String, description: "创建者" },
    layout      : {
      name        : { type: String, description: "名前" },
      comment     : { type: String, description: "说明" },
      image       : {
        imageH      : { type: String, description: "横向全画面イメージ" },
        imageV      : { type: String, description: "?向" }
      },

      page        : [
        {
          image     : { type: String, description: "全画面イメージ" },
          type      : { type: Number, description: "1:横 2:縦" },
          tile      : [
            {
              num         : { type: Number, description: "序号" },
              rowspan     : { type: Number, description: "行数" },
              colspan     : { type: Number, description: "列数" },
              syntheticId : { type: String, description: "ネタID" },
              synthetic   : {
                name        : { type: String, description: "ネタ名" },
                type        : { type: String, description: "ネタタイプ" } ,
                subtype     : { type: String, description: "标识类型" },
                coverrows   : { type: Number, description: "封面占九宫格的行数" },
                covercols   : { type: Number, description: "封面占九宫格的列数" },
                cover       : [
                  {
                    material   : {
                      fileid    : { type: String, description: "元素文件的ID" },
                      thumb     : {
                        big     : { type: String, description: "缩略图big" },
                        middle  : { type: String, description: "缩略图mid" },
                        small   : { type: String, description: "缩略图small" }
                      }
                    },
                    type       : { type: String, description: "カバータイプ：1:ビデオ,2:画像" }
                  }
                ],
                page        : { type: String, description: "ページ数" },
                metadata    : [
                  {
                    index       : { type: Number, description: "索引" },
                    prefix      : { type: String, description: "前缀" }, //
                    material_id : {type:String,description:"素材ID"},
                    material    : {
                      fileid  : { type: String, description: "元素文件的ID" },
                      thumb   : {
                        big     : { type: String, description: "缩略图big" },
                        middle  : { type: String, description: "缩略图mid" },
                        small   : { type: String, description: "缩略图small" }
                      }
                    },
                    bgmaterial  : {
                      fileid  : { type: String, description: "元素文件的ID" },
                      thumb   : {
                        big     : { type: String, description: "缩略图big" },
                        middle  : { type: String, description: "缩略图mid" },
                        small   : { type: String, description: "缩略图small" }
                      }
                    },
                    effect      : {
                      type: String,
                      description: "效果: none, zoomAndMoveRightDown, zoom, zoomOut, moveRightUp, up"
                    },
                    txtmaterial : {
                      fileid  : { type: String, description: "元素文件的ID" },
                      thumb   : {
                        big     : { type: String, description: "缩略图big" },
                        middle  : { type: String, description: "缩略图mid" },
                        small   : { type: String, description: "缩略图small" }
                      }
                    },
                    widget      : [
                      {
                        index     : { type: Number, description: "索引" },
                        title     : { type: String, description: "描述" },
                        name      : { type: String, description: "插件的名称" },
                        widgetId  : { type: String, description: "前台的widget_id" },
                        width     : { type: Number, description: "宽度" },
                        height    : { type: Number, description: "高度" },
                        top       : { type: Number, description: "TOP值" },
                        left      : { type: Number, description: "left值" },
                        background: { type: Number, description: "Widget的背景  不需要背景" },
                        effect    : { type: String, description: "效果" },
                        action    : {
                          type      : { type: String, description: "动作类型" },
                          value     : { type: String, description: "动作值" },
                          tags      : [
                            {
                              tag     : { type: String, description: "分类" },
                              subtag  : { type: String, description: "子分类" }
                            }
                          ],
                          material  : {
                            fileid    : { type: String, description: "元素文件的ID" },
                            thumb     : {
                              big     : { type: String, description: "缩略图big" },
                              middle  : { type: String, description: "缩略图mid" },
                              small   : { type: String, description: "缩略图small" }
                            }
                          },
                          bg_material_id: {type: String, description: "Introduction 背景图片"},
                          bgmaterial    : {
                            fileid      : { type: String, description: "元素文件的ID" },
                            thumb       : {
                              big       : { type: String, description: "缩略图big" },
                              middle    : { type: String, description: "缩略图mid" },
                              small     : { type: String, description: "缩略图small" }
                            }
                          },
                          urlScheme   : { type: String, description: "urlScheme" },
                          downloadURL : { type: String, description: "URL：" }
                        },
                        metadata_id: {type: String, description: "前台的metadata_id"},
                        page: {type: String, description: "page"}
                      }
                    ]
                  }
                ]
              }
            }
          ]
        }
      ]
    }},
  history: [
    {
      version     : { type: Number, description: "版本" },
      confirmat   : { type: Date, description: "承认时间" },
      confirmby   : { type: String, description: "承認者" },
      editat      : { type: Date, default: Date.now, description: "更新時間" },
      editby      : { type: String, description: "修改者" },
      createat    : { type: Date, default: Date.now },
      createby    : { type: String, description: "创建者" },
      layout      : {
        name: { type: String, description: "名前" },
        image: {
          imageH: { type: String, description: "横向全画面イメージ" },
          imageV: { type: String, description: "竖向" }
        },
        page: [
          {
            image :   { type: String, description: "全画面イメージ" },
            type  :   { type: Number, description: "1:横 2:縦" },
            tile: [
              {
                num         : { type: Number, description: "1:横 2:縦" },
                rowspan     : { type: Number, description: "行数" },
                colspan     : { type: Number, description: "列数" },
                syntheticId : { type: String, description: "ネタID" },
                synthetic   : {
                  name: { type: String, description: "ネタ名" },
                  type: { type: String, description: "ネタタイプ" },
                  cover: [
                    {
                      material: {
                        fileid: { type: String, description: "元素文件的ID" },
                        thumb: {
                          big       : { type: String, description: "缩略图big" },
                          middle    : { type: String, description: "缩略图mid" },
                          small     : { type: String, description: "缩略图small" }
                        }
                      },
                      type: { type: String, description: "カバータイプ：1:ビデオ,2:画像" }
                    }
                  ],
                  page: { type: String, description: "ページ数" },
                  metadata: [
                    {
                      index: { type: Number, description: "索引" },
                      prefix: { type: String, description: "前缀" }, // 未定
                      material_id: { type: String, description: "素材ID" },
                      material: {
                        fileid: { type: String, description: "元素文件的ID" },
                        thumb: {
                          big       : { type: String, description: "缩略图big" },
                          middle    : { type: String, description: "缩略图mid" },
                          small     : { type: String, description: "缩略图small" }
                        }
                      },
                      effect: {
                        type: String,
                        description: "效果: none, zoomAndMoveRightDown, zoom, zoomOut, moveRightUp, up"
                      },
                      txtmaterial: {
                        fileid: { type: String, description: "元素文件的ID" },
                        thumb: {
                          big       : { type: String, description: "缩略图big" },
                          middle    : { type: String, description: "缩略图mid" },
                          small     : { type: String, description: "缩略图small" }
                        }
                      },
                      widget: [
                        {
                          index: { type: Number, description: "索引" },
                          title: { type: String, description: "描述" },
                          name: { type: String, description: "插件的名称" },
                          widget_id: { type: String, description: "对应前台的widget_id" },
                          width: { type: Number, description: "宽度" },
                          height: { type: Number, description: "高度" },
                          top: { type: Number, description: "top值" },
                          left: { type: Number, description: "left值" },
                          background: { type: Number, description: "Widget的背景  不需要背景" },
                          effect: { type: String, description: "效果" },
                          action: {
                            type: { type: String, description: "动作类型" },
                            value: { type: String, description: "动作类型" },
                            material_id: { type: String, description: "素材ID" },
                            material: {
                              fileid: { type: String, description: "元素文件的ID" },
                              thumb: {
                                big       : { type: String, description: "缩略图big" },
                                middle    : { type: String, description: "缩略图mid" },
                                small     : { type: String, description: "缩略图small" }
                              }
                            },
                            urlScheme: { type: String, description: "app启动urlScheme：仅app启动类型" },
                            downloadURL: { type: String, description: "app启动下载URL：仅app启动类型" }
                          },
                          material_id: { type: String, description: "对应前台的metadata_id" },
                          page: { type: String, description: "页数" }
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    }
  ]
});


//////////////////////////////////////////////////

function model(code) {
  return conn(code).model('PublishLayout', PublishLayout);
}

exports.find = function(code_,condition_,callback_){
  model(code_).find(condition_,function(err,result){
    callback_(err, result);
  });
}

exports.get = function (code, condition_,callback_){

  var publishLayout = model(code);

  publishLayout.findOne(condition_,function(err,result){
    callback_(err, result);
  });
};

exports.add = function(code, publishLayout, callback){

  var publish = model(code);

  new publish(publishLayout).save(function(err, result){
    callback(err, result);
  });
};


/**
 * 更新PublishLayout
 * @param code      公司code
 * @param id        查找id
 * @param layout    数据
 * @param callback  返回成功
 */

exports.update = function (code, id, layout, callback) {

  var publishLayout = model(code);

  publishLayout.findByIdAndUpdate(id,
    { $addToSet: { history: layout }, $set: { active: layout, valid: 1 } },
    function (err, result) {

      return callback(err, result);
    });

};


/**
 * 删除PublishLayout
 * @param code      公司code
 * @param uid       用户uid
 * @param id        数据的id
 * @param callback  返回信息
 */

exports.remove = function (code, uid, id, callback) {

  var publishLayout = model(code);

  publishLayout.findByIdAndUpdate(id, {valid: 0}, function (err, result) {
    return callback(err, result);
  });

};

/**
 * 统计PublishLayout个数
 * @param code      公司code
 * @param condition 查询条件
 * @param callback  返回个数
 */


exports.total = function (code, condition, callback) {

  var publishLayout = model(code);
  publishLayout.count(condition).exec(function (err, count) {
    return callback(err, count);
  });

};

/**
 * 获得PublishLayout一览
 * @param code      公司code
 * @param condition 查询条件
 * @param start     开始值
 * @param limit     长度
 * @param callback  返回个数
 */

exports.getList = function (code, condition, start, limit, callback) {

  var publishLayout = model(code);
  publishLayout.find(condition).select("_id layoutId active")
    .skip(start || 0)
    .limit(limit || 20)
    .sort({ "active.editat": -1 })
    .exec(function (err, result) {

      return callback(err, result);
    });

};


