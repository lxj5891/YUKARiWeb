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
    ,condition = {};
  condition.valid = 1;
  if(handler.params.keyword){
  //已经添加正则表达式，by zhaobing
    var keyword = handler.params.keyword;
    if (keyword) {
      keyword = util.quoteRegExp(keyword);
      condition.name = new RegExp(keyword.toLowerCase(), "i");
    }


  };
  console.log()

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
 * @param code_
 * @param uid_
 * @param fid_
 * @param file_
 * @param callback_
 */
exports.updatefile = function(code_, uid_, fid_, file_, callback_) {

  var name = ph.basename(file_.name);
  var path = fs.realpathSync(ph.join(confapp.tmp, ph.basename(file_.path)));

  var metadata = {
    "author": uid_
    , "tags": types(file_.type)
  };

  // To save the file to GridFS
  gridfs.save(code_, name, path, metadata, file_.type, function(err, doc){
    if (err) {
      return callback_(new error.InternalServer(err));
    }

    var detail = {};
    detail["filename"] = doc.filename;
    detail["fileid"] = doc._id;
    detail["chunkSize"] = doc.chunkSize;
    detail["contentType"] = doc.contentType;
    detail["length"] = doc.length;
    detail["editat"] = doc.uploadDate;
    detail["editby"] = uid_;

    material.update(code_, fid_, detail, function(err, info){

      // create thumbs
      mq.thumb({id: info._id, fid: doc._id, collection: "materials", x: "0", y: "0", width: "0"});

      // add user info
      user.appendUser(code_, [info], "editby", function(err, result){
        return callback_(err, result[0]);
      });
    });
  });

};
exports.edit = function(handler,callback){
  console.log("ctrl----------------------1"+handler.params.updateFile);
//  console.log("--------------ctrl:"+handler.updateFile.fileName);
  file.update(handler,function(err, result){
    if(err){
      return callback(new error.InternalServer(err));
    }
//    console.log("handler.params.updateFile"+handler.params.updateFile);
    callback(err,result);
  });
}
/**
 * 更新详细信息
 * @param code_
 * @param uid_
 * @param fid_
 * @param detail_
 * @param callback_
 */
/*exports.edit = function(code_, fname_ , uid_, fid_, detail_, callback_) {

  detail_["editat"] = new Date();
  detail_["editby"] = uid_;
  detail_["filename"] = fname_;
  detail_.tags = _.compact(detail_.tags);

  var tasks = [];

  // 获取原来的tag一览
  tasks.push(function(cb) {
    material.get(code_, fid_, function(err, data) {
      cb(err, data.tags);
    });
  });

  // 新增的tag，添加到tag表
  tasks.push(function(data, cb) {
    var add = _.difference(detail_.tags, data);

    if (add && add.length > 0) {
      tag.add(code_, uid_, add, function(err, result){
        cb(err, data);
      });
    } else {
      cb(null, data);
    }
  });

  // 删除的tag，从tag表移除
  tasks.push(function(data, cb) {
    var remove = _.difference(data, detail_.tags);

    if (remove && remove.length > 0) {
      tag.remove(code_, uid_, remove, function(err, result){
        cb(err, data);
      });
    } else {
      cb(null, data);
    }
  });

  // 更新素材表
  tasks.push(function(data, cb){
    material.replace(code_, fid_, detail_, function(err, info){
      return callback_(err, info);
    });
  });

  async.waterfall(tasks, function(err, result){
    return callback_(err, result);
  });
};*/

/**
 * 删除
 * @param code_
 * @param uid_
 * @param fid_
 * @param callback_
 */
//exports.remove = function(code_, uid_, fid_, callback_) {
//  // 保留GridFS中的文件，而不删除
//  checkMaterialHasUse(code_, fid_, function(err, count){
//    if(count>0){
//      return callback_(new error.BadRequest(__("js.ctr.material.used.error")));
//    } else {
//      material.remove(code_, fid_, function(err, info){
//        return callback_(err, info);
//      });
//    }
//  });
//}
exports.remove = function(handler, callback_) {
  // 保留GridFS中的文件，而不删除

  checkMaterialHasUse(handler.code, handler.params.fileInfoId, function(err, count){
    console.log("count: "+ count);
    if(count>0){
      return callback_(new error.BadRequest(__("js.ctr.material.used.error")));
    } else {
      file.remove(handler,function(err,result){
        if(err){
          return callback_(new error.InternalServer(err));
        }
        return callback_(err,result);
      });
//      material.remove(code_, fid_, function(err, info){
//        return callback_(err, info);
//      });
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
  console.log("count1: " +count);
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
    console.log("count1: " +count);
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

