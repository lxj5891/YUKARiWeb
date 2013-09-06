var ph        = require('path')
  , fs        = require('fs')
  , async     = require('async')
  , _         = require('underscore')
  , material  = require('../modules/mod_material.js')
  , synthetic = require('../modules/mod_synthetic.js')
  , mq        = require('./ctrl_mq.js')
  , confapp   = require('config').app
  , tag       = require('./ctrl_tag')
  , gridfs    = lib.mod.gridfs
  , user      = lib.ctrl.user
  , error     = lib.core.errors;

var EventProxy = require('eventproxy');
exports.list = function(contentType_,company_,keyword_, tags_, start_, limit_, callback_) {

  var start = start_ || 0
    , limit = limit_ || 20
    , condition = { company: company_ };

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

  // 检索用关键字
  if (keyword_) {
    condition.keyword = new RegExp("^" + keyword_.toLowerCase() + ".*$", "i");
  }

  material.total(condition, function(err, count){
    if (err) {
      return callback_(new error.InternalServer(err));
    }

    material.list(condition, start, limit, function(err, result){
      if (err) {
        return callback_(new error.InternalServer(err));
      }

      // 添加用户信息
      user.appendUser(result, "editby", function(err, result){
        return callback_(err, {totalItems: count, items:result});
      });
    });
  });
};

/**
 * 保存文件
 */
exports.add = function(company_, uid_, files_, callback_) {

  var result = [];

  async.forEach(files_, function(file, callback){

    var name = ph.basename(file.name);
    var path = fs.realpathSync(ph.join(confapp.tmp, ph.basename(file.path)));
    var metadata = {
      "author": uid_
      , "company": company_
      , "tags": types(file.type)
    };

    // To save the file to GridFS
    gridfs.save(name, path, metadata, file.type, function(err, doc){

      if (err) {
        return callback(new error.InternalServer(err));
      }

      var detail = {};
      detail["company"] = company_;
      detail["fileid"] = doc._id;
      detail["filename"] = doc.filename;
      detail["chunkSize"] = doc.chunkSize;
      detail["contentType"] = doc.contentType;
      detail["length"] = doc.length;
      detail["editat"] = doc.uploadDate;
      detail["editby"] = uid_;

      material.save(detail, function(err, info){
        result.push(info);

        // create thumbs
        mq.thumb({id: info._id, fid: doc._id, collection: "materials", x: "0", y: "0", width: "0"});
        return callback(err);
      });
    });

  }, function(err){
    return callback_(err, result);
  });

};

/**
 * 更新文件
 * @param company_
 * @param uid_
 * @param fid_
 * @param file_
 * @param callback_
 */
exports.updatefile = function(company_, uid_, fid_, file_, callback_) {

  var name = ph.basename(file_.name);
  var path = fs.realpathSync(ph.join(confapp.tmp, ph.basename(file_.path)));

  var metadata = {
    "author": uid_
    , "company": company_
    , "tags": types(file_.type)
  };

  // To save the file to GridFS
  gridfs.save(name, path, metadata, file_.type, function(err, doc){
    if (err) {
      return callback_(new error.InternalServer(err));
    }

    var detail = {};
    detail["company"] = company_;
    detail["filename"] = doc.filename;
    detail["fileid"] = doc._id;
    detail["chunkSize"] = doc.chunkSize;
    detail["contentType"] = doc.contentType;
    detail["length"] = doc.length;
    detail["editat"] = doc.uploadDate;
    detail["editby"] = uid_;

    material.update(fid_, detail, function(err, info){

      // create thumbs
      mq.thumb({id: info._id, fid: doc._id, collection: "materials", x: "0", y: "0", width: "0"});

      // add user info
      user.appendUser([info], "editby", function(err, result){
        return callback_(err, result[0]);
      });
    });
  });

};

/**
 * 更新详细信息
 * @param company_
 * @param uid_
 * @param fid_
 * @param detail_
 * @param callback_
 */
exports.updatetag = function(company_, uid_, fid_, detail_, callback_) {

  detail_["editat"] = new Date();
  detail_["editby"] = uid_;

  var tasks = [];
  console.log("----------------------------------------");
  // 获取原来的tag一览
  tasks.push(function(cb) {
    material.get(fid_, function(err, data) {
      cb(err, data.tags);
    });
  });

  // 新增的tag，添加到tag表
  tasks.push(function(data, cb) {
    var add = _.difference(detail_.tags, data);

    console.log(data);
    console.log(detail_.tags);
    console.log(add);
    if (add && add.length > 0) {
      tag.add(company_, uid_, add, function(err, result){
        cb(err, data);
      });
    } else {
      cb(null, data);
    }
  });

  // 删除的tag，从tag表移除
  tasks.push(function(data, cb) {
    var remove = _.difference(data, detail_.tags);
    console.log(remove);
    if (remove && remove.length > 0) {
      tag.remove(company_, uid_, remove, function(err, result){
        cb(err, data);
      });
    } else {
      cb(null, data);
    }
  });

  // 更新素材表
  tasks.push(function(data, cb){
    material.replace(fid_, detail_, function(err, info){
      console.log(info);
      return callback_(err, info);
    });
  });

  async.waterfall(tasks, function(err, result){
    console.log(result);
    return callback_(err, result);
  });

};

/**
 * 删除
 * @param company_
 * @param uid_
 * @param fid_
 * @param callback_
 */
exports.remove = function(company_, uid_, fid_, callback_) {

  // 保留GridFS中的文件，而不删除
  checkMaterialHasUse(fid_,function(err,count){
    if(count>0){
      console.log("已经使用");
      return callback_(new error.BadRequest("素材已经使用"));
    } else {
      material.remove(fid_, function(err, info){
        return callback_(err, info);
      });

    }
  });

}
function checkMaterialHasUse(material_id,callback){
  var ep = EventProxy.create('pic_use','txt_use','widget_use',function(pic_use,txt_use,widget_use){
    var count = pic_use + txt_use + widget_use;
    console.log("count  ,  %s  :" , count);
    callback(null,count)
  });
  synthetic.count({"metadata.material_id":material_id},function(err,count){
    ep.emit('pic_use',count);
  });
  synthetic.count({"metadata.txtmaterial_id":material_id},function(err,count){
    ep.emit('txt_use',count);
  });
  synthetic.count({"metadata.widget.action.material_id":material_id},function(err,count){
    ep.emit('widget_use',count);
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

