var mongo = require('mongoose')
  , util = require('util')
  , conn = require('./connection')
  , schema = mongo.Schema;

/**
 * 公开中的Layout
 * @type {schema}
 */
var PublishLayout = new schema({
  company: {type: String, description: ""},
  layoutId: {type: String},
  valid: {type: Number, default: 1},
  active: {
    version: {type:Number},
    confirmat: {type: Date},
    confirmby: {type: String, description:"承認者"},
    viewerUsers: [{type:String, description:"公開先User"}],
    viewerGroups: [{type:String, description:"公開先Group"}],
    openStart: {type: Date, description:"公開开始"},
    openEnd: {type: Date, description:"公開终止"},
    editat: {type: Date, default: Date.now, description: "更新時間"},
    editby: {type: String},
    createat: { type: Date, default: Date.now },
    createby: {type: String},
    layout: {
      name: {type: String, description: "名前"},
      comment: {type: String, description: "说明"},
      image: {
        imageH: {type:String, description:"横向全画面イメージ"},
        imageV: {type:String, description:"?向"}
      },
      page: [{
        image: {type:String, description:"全画面イメージ"},
        type: {type:Number, description:"1:横 2:縦"},
        tile: [{
          num: {type:Number},
          rowspan: {type:Number, description:"行数"},
          colspan: {type:Number, description:"列数"},
          syntheticId: {type:String, description:"ネタID"},
          synthetic:{
            name: {type: String, description: "ネタ名"},
            type: { type: String, description: "ネタタイプ"},
            coverrows: {type: Number, description: "封面占九宫格的行数"},
            covercols: {type: Number, description: "封面占九宫格的列数"},
            cover: [{
              material :{
                fileid: {type: String, description: "元素文件的ID"},
                thumb: {
                  big: {type: String},
                  middle: {type: String},
                  small: {type: String}
                }
              },
              type: {type: String, description: "カバータイプ：1:ビデオ,2:画像"}
            }],
            page: {type: String, description: "ページ数"},
            metadata: [{
              index: {type: Number, description: "索引"},
              prefix: {type: String, description: "前?"}, // 未定
              material_id : {type:String,description:"素材ID"},
              material :{
                fileid: {type: String, description: "元素文件的ID"},
                thumb: {
                  big: {type: String},
                  middle: {type: String},
                  small: {type: String}
                }
              },
              effect: {type: String, description: "效果: none, zoomAndMoveRightDown, zoom, zoomOut, moveRightUp, up}"},
              txtmaterial :{
                fileid: {type: String, description: "元素文件的ID"},
                thumb: {
                  big: {type: String},
                  middle: {type: String},
                  small: {type: String}
                }
              },
              widget: [{
                index : {type: Number, description: "索引"},
                title: {type: String, description: "描述"},
                name : {type: String, description: "插件的名称"},
                widget_id : {type: String, description: "前台的widget_id"},
                width: {type: Number},
                height: {type: Number},
                top: {type: Number},
                left: {type: Number},
                background: {type: Number, description: "Widget的背景  不需要背景"},
                effect: {type: String, description: "效果"},
                action: {
                  type: {type: String, description: "action"},
                  value: {type: String, description: "action"},
                  material :{
                    fileid: {type: String, description: "元素文件的ID"},
                    thumb: {
                      big: {type: String},
                      middle: {type: String},
                      small: {type: String}
                    }
                  },
                  urlScheme: {type: String, description: "urlScheme"},
                  downloadURL: {type: String, description: "URL："}
                },
                metadata_id :{type: String, description: "前台的metadata_id"},
                page :{type: String, description: "page"}
              }]
            }]
          }
        }]
      }]
    }},
  history: [{
      version: {type:Number},
      confirmat: { type: Date},
      confirmby: {type: String, description:"承認者"},
      editat: {type: Date, default: Date.now, description: "更新時間"},
      editby: {type: String},
      createat: { type: Date, default: Date.now },
      createby: {type: String},
      layout: {
          name: {type: String, description: "名前"},
          image: {
            imageH: {type:String, description:"横向全画面イメージ"},
            imageV: {type:String, description:"竖向"}
          },
          page: [{
              image: {type:String, description:"全画面イメージ"},
              type: {type:Number, description:"1:横 2:縦"},
              tile: [{
                  num: {type:Number},
                  rowspan: {type:Number, description:"行数"},
                  colspan: {type:Number, description:"列数"},
                  syntheticId: {type:String, description:"ネタID"},
                  synthetic:{
                      name: {type: String, description: "ネタ名"},
                      type: { type: String, description: "ネタタイプ"},
                      cover: [{
                        material :{
                          fileid: {type: String, description: "元素文件的ID"},
                          thumb: {
                            big: {type: String},
                            middle: {type: String},
                            small: {type: String}
                          }
                        },
                        type: {type: String, description: "カバータイプ：1:ビデオ,2:画像"}
                      }],
                      page: {type: String, description: "ページ数"},
                      metadata: [{
                        index: {type: Number, description: "索引"},
                        prefix: {type: String, description: "前缀"}, // 未定
                        material_id : {type:String,description:"素材ID"},
                        material :{
                          fileid: {type: String, description: "元素文件的ID"},
                          thumb: {
                            big: {type: String},
                            middle: {type: String},
                            small: {type: String}
                          }
                        },
                        effect: {type: String, description: "效果: none, zoomAndMoveRightDown, zoom, zoomOut, moveRightUp, up}"},
                        txtmaterial :{
                          fileid: {type: String, description: "元素文件的ID"},
                          thumb: {
                            big: {type: String},
                            middle: {type: String},
                            small: {type: String}
                          }
                        },
                        widget: [{
                          index : {type: Number, description: "索引"},
                          title: {type: String, description: "描述"},
                          name : {type: String, description: "插件的名称"},
                          widget_id : {type: String, description: "对应前台的widget_id"},
                          width: {type: Number},
                          height: {type: Number},
                          top: {type: Number},
                          left: {type: Number},
                          background: {type: Number, description: "Widget的背景  不需要背景"},
                          effect: {type: String, description: "效果"},
                          action: {
                            type: {type: String, description: "动作类型"},
                            value: {type: String, description: "动作类型"},
                            material_id : {type:String,description:"素材ID"},
                            material :{
                              fileid: {type: String, description: "元素文件的ID"},
                              thumb: {
                                big: {type: String},
                                middle: {type: String},
                                small: {type: String}
                              }
                            },
                            urlScheme: {type: String, description: "app启动urlScheme：仅app启动类型"},
                            downloadURL: {type: String, description: "app启动下载URL：仅app启动类型"}
                          },
                          metadata_id :{type: String, description: "对应前台的metadata_id"},
                          page :{type: String, description: "page"}
                        }]
                      }]
                  }
              }]
          }]
      }
  }]
});

//////////////////////////////////////////////////

function model(code) {
  return conn(code).model('PublishLayout', PublishLayout);
}

exports.get = function (code, condition_,callback_){

  var publishLayout = model(code);

  publishLayout.findOne(condition_,function(err,result){
    callback_(err, result);
  });
};

exports.add = function(code, publishLayout_, callback_){

  var publishLayout = model(code);

  new publishLayout(publishLayout_).save(function(err, result){
    callback_(err, result);
  });
};

exports.update = function (code, id_, layout_, callback_) {
  var publishLayout = model(code);

  publishLayout.findByIdAndUpdate(id_, {$addToSet: {history: layout_}, $set: {active: layout_, valid: 1}}, function(err, result){
    callback_(err, result);
  });
};

// DELETE
exports.remove = function (code, uid_, id_, callback_) {

  var publishLayout = model(code);

  publishLayout.findByIdAndUpdate(id_, {valid: 0}, function(err, result){
    callback_(err, result);
  });
};

// 获取一览
exports.list = function(code, condition_, start_, limit_, callback_){

  var publishLayout = model(code);

  publishLayout.find(condition_)
    .skip(start_ || 0)
    .limit(limit_ || 20)
    .sort({"active.editat": -1})
    .exec(function(err, result){
      callback_(err, result);
    });
};

// 获取件数
exports.total = function(code, condition_, callback_){
  var publishLayout = model(code);
  publishLayout.count(condition_).exec(function(err, count){
    callback_(err, count);
  });
};

// 获取一览
exports.activeList = function(code, condition_, start_, limit_, callback_){

  var publishLayout = model(code);
 console.log(condition_);
  publishLayout.find(condition_).select('_id layoutId active')
    .skip(start_ || 0)
    .limit(limit_ || 20)
    .sort({"active.editat": -1})
    .exec(function(err, result){
      callback_(err, result);
    });
};


