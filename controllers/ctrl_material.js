var ph        = smart.lang.path
  , fs        = smart.lang.fs
  , sync = smart.util.async
  , _ = smart.util.underscore
  , material  = require('../modules/mod_material.js')
  , synthetic = require('../modules/mod_synthetic.js')
  , mq        = require('./ctrl_mq.js')
  , confapp   = smart.util.config.app
  , tag       = require('./ctrl_tag')
//  , gridfs    = smart.mod.gridfs
  , user      = smart.ctrl.user
  , error     = smart.framework.errors
  , util      = smart.lang.util;


//var EventProxy = require('eventproxy');

exports.list = function(code_, contentType_, keyword_, tags_, start_, limit_, callback_) {

  var start = start_ || 0
    , limit = limit_ || 20
    , condition = {};

  // 指定的Tag
  if (tags_){

    var or = [];
    _.each(tags_.split(","), function(item){
      or.push({tags: item});
    });
    condition.$or = or;
  }
  if  (contentType_){
    if("image" == contentType_ )
      condition.contentType = /image/;
    else if("video" == contentType_)
      condition.contentType = /video/;
    else
      condition.contentType = / /;
  }
  if (keyword_&& keyword_.length>0) {
    keyword_ = util.quoteRegExp(keyword_);
    condition.filename = new RegExp(keyword_.toLowerCase(),"i");
  }

  material.total(code_, condition, function(err, count){
    if (err) {
      return callback_(new error.InternalServer(err));
    }

    material.getList(code_, condition, start, limit, function(err, result){
      if (err) {
        return callback_(new error.InternalServer(err));
      }

      // 添加用户信息
      user.appendUser(code_, result, "editby", function(err, result){
        return callback_(err, {totalItems: count, items:result});
      });
    });
  });
};

exports.add = function(code_, uid_, files_, callback_) {

  var result = [];

  async.forEach(files_, function(file, callback){

    var name = ph.basename(file.name);
    var path = fs.realpathSync(ph.join(confapp.tmp, ph.basename(file.path)));
    var metadata = {
      "author": uid_
      , "tags": types(file.type)
    };

    // To save the file to GridFS
    gridfs.save(code_, name, path, metadata, file.type, function(err, doc){

      if (err) {
          return callback(new error.InternalServer(err));
      }

      var detail = {};
      detail["fileid"] = doc._id;
      detail["filename"] = doc.filename;
      detail["chunkSize"] = doc.chunkSize;
      detail["contentType"] = doc.contentType;
      detail["length"] = doc.length;
      detail["editat"] = doc.uploadDate;
      detail["editby"] = uid_;

      material.add(code_, detail, function(err, info){
       result.push(info);

       // create thumbs
       mq.thumb({code: code_
         , id: info._id
         , fid: doc._id
         , collection: "materials"
         , x: "0", y: "0"
         , width: "0"});

         return callback(err);
       });
    });

  },function(err){
    return callback_(err, result);
  });

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

/**
 * 更新详细信息
 * @param code_
 * @param uid_
 * @param fid_
 * @param detail_
 * @param callback_
 */
exports.edit = function(code_, fname_ , uid_, fid_, detail_, callback_) {

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

};

/**
 * 删除
 * @param code_
 * @param uid_
 * @param fid_
 * @param callback_
 */
exports.remove = function(code_, uid_, fid_, callback_) {

  // 保留GridFS中的文件，而不删除
  checkMaterialHasUse(code_, fid_, function(err, count){
    if(count>0){
      return callback_(new error.BadRequest(__("js.ctr.material.used.error")));
    } else {
      material.remove(code_, fid_, function(err, info){
        return callback_(err, info);
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

  var ep = EventProxy.create('cover_use', 'pic_use','txt_use','widget_use', function(cover_use, pic_use, txt_use, widget_use){
    return callback(null, cover_use + pic_use + txt_use + widget_use);
  });

  synthetic.count(code_, {"cover.material_id": material_id, valid: 1}, function(err,count){
    ep.emit('cover_use', count);
  });

  synthetic.count(code_, {"metadata.material_id": material_id, valid: 1}, function(err,count){
    ep.emit('pic_use', count);
  });

  synthetic.count(code_, {"metadata.txtmaterial_id":material_id, valid: 1}, function(err,count){
    ep.emit('txt_use', count);
  });

  synthetic.count(code_, {"metadata.widget.action.material_id":material_id, valid: 1}, function(err,count){
    ep.emit('widget_use', count);
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

