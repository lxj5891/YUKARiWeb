var ph        = smart.lang.path
  ,log        =smart.framework.log
  , fs        = smart.lang.fs
  , async     = smart.util.async
  , _         = smart.util.underscore
  , material  = require('../modules/mod_material.js')
  , synthetic = require('../modules/mod_synthetic.js')
  , mq        = require('./ctrl_mq.js')
  , confapp   = smart.util.config.app
  , tag       = require('./ctrl_tag')
  , file      = smart.ctrl.file
  , user      = smart.ctrl.user
  , error     = smart.framework.errors
  , util      = smart.framework.util;


//var EventProxy = require('eventproxy');
/////////edit by zhaobing
exports.list = function(handler, callback) {

  var tags_ = handler.params.tags
    , contentType_ = handler.params.contentType_
    , condition = {"valid":1};
  if(handler.params.keyword){
  //已经添加正则表达式，by zhaobing
    var keyword = handler.params.keyword;
    if (keyword) {
      keyword = util.quoteRegExp(keyword);
      condition.name = new RegExp(keyword.toLowerCase(), "i");
    }
  };
  if (contentType_){
    if("image" == contentType_ )
      condition.contentType = /image/;
    else if("video" == contentType_)
      condition.contentType = /video/;
    else
      condition.contentType = / /;
  }
  handler.addParams("tags",tags_);
  handler.addParams("condition",  condition);
  handler.print(log.debug);

  file.getList(handler, function(err, result) {
    if (err) {
      log.error(err, uid);
      return callback(new errors.NotFound("js.ctr.common.system.error"));
    } else {
      return callback(err, result);
    }
  });
};

//added by wuql at 20131223 copy from diandianweb ctrl_file
exports.add = function(handler,callback){

  file.add(handler,function(err,result){
    if(err){
      return callback(new error.InternalServer(err));
    }
    callback(err,result[0]._id);
  })
};

/**
 * 更新文件
 * @param handler_
 * @param callback_
 */
//////////edit by zhaobing///////////////////////////////////////////////////////////////////////////////////
exports.updatefile = function(handler,callback){

  handler.addParams('updateFile', handler.req.files.updateFile);
  handler.addParams('filePath', handler.req.files.updateFile.path);
  handler.addParams('options', handler.req.files.updateFile.type);
  handler.addParams('fileName', handler.req.files.updateFile.filename);
  file.updateFile(handler,function(err, result){
    if(err){
      return callback(new error.InternalServer(err));
    }
    var data = {};
    data.items = result;
    callback(err,data);
  });

}
/////////////////////////////////////////////////////////////////////////////////////////////

/**
 * 更新文件详细信息
 * @param handler_
 * @param callback_
 */
exports.edit = function(handler,callback){
  file.update(handler,function(err, result){
    if(err){
      return callback(new error.InternalServer(err));
    }
    callback(err,result);
  });
}

/**
 * 删除
 * @param handler
 * @param callback_
 */
exports.remove = function(handler, callback_) {
  // 保留GridFS中的文件，而不删除

  checkMaterialHasUse(handler.code, handler.params.fileInfoId, function(err, count){
    if(count>0){
      return callback_(new error.BadRequest(__("js.ctr.material.used.error")));
    } else {
      file.remove(handler,function(err,result){
        if(err){
          return callback_(new error.InternalServer(err));
        }
        return callback_(err,result);
      });
    }
  });
}


/**
 * 检查是否有元素被使用
 * @param code_
 * @param material_id
 * @param callback
 */
function checkMaterialHasUse(code_, material_id, callback){

  var tasks = [];
  var count = 0;
  tasks.push(function(cb){
    synthetic.count(code_, {"cover.material_id": material_id, valid: 1}, function(err,count1){
      count = count + count1
      cb(null);
    });
  });
  tasks.push(function(cb){
    synthetic.count(code_, {"metadata.material_id": material_id, valid: 1}, function(err,count1){
      count = count + count1
      cb(null);
    });
  });
  tasks.push(function(cb){
    synthetic.count(code_, {"metadata.txtmaterial_id":material_id, valid: 1}, function(err,count1){
      count = count + count1
      cb(null);
    });
  });
  tasks.push(function(cb){
    synthetic.count(code_, {"metadata.widget.action.material_id":material_id, valid: 1}, function(err,count1){
      count = count + count1
      cb(null);
    });
  });
  async.waterfall(tasks, function(err, result){
    return callback(err, count);
  });
}

/**
 * 根据Content Types，对文件分类
 */
function types(str) {

  if (str.match(/^image\/.*$/)) {
    return "image";
  }

  if (str.match(/^video\/.*$/)) {
    return "video";
  }

  if (str.match(/^audio\/.*$/)) {
    return "audio";
  }

  // application / example / message / model / multipart / text
  return "application";
}

function contenttype2extension(contenttype, filename) {

  var mime = {
      "application/msword": "doc"
    , "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx"
    , "application/vnd.ms-excel": "xls"
    , "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx"
    , "application/vnd.ms-powerpoint": "ppt"
    , "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx"
    , "application/vnd.openxmlformats-officedocument.presentationml.slideshow": "ppsx"
    , "application/pdf": "pdf"
    , "application/rtf": "rtf"
    , "application/zip": "zip"
    , "image/bmp": "bmp"
    , "image/gif": "gif"
    , "image/jpeg": "jpeg"
    , "image/png": "png"
    , "image/tiff": "tiff"
    , "text/plain": "txt"
    , "video/msvideo": "avi"
    , "video/quicktime": "mov"
  };

  var extension = mime[contenttype];
  if (extension) {
    return extension;
  }

  extension = ph.extname(filename);
  if (extension.length > 0) {
    return extension.substr(1);
  }

  return "";
}

