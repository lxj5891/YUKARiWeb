var _ = require('underscore')
  , synthetic = require('../modules/mod_synthetic.js')
  , layout    = require('../modules/mod_layout')
  , material = require('../modules/mod_material.js')
  , user = lib.ctrl.user
  , error = lib.core.errors
  , util     = lib.core.util;

var async = require('async');
var EventProxy = require('eventproxy');

exports.getSyntheticById = function (code, synthetic_id, callback) {
  if(synthetic_id&&synthetic_id.length<20){
    callback(null,{
      type:synthetic_id
    });
    return;
  }
  synthetic.findOne(code, synthetic_id, function (err, docs) {
    if(err || !docs){
      return callback(err,null);
    }

    var ep = EventProxy.create('metedata', 'cover', function (metedata, cover) {
      docs._doc.metadata = metedata;
      docs._doc.cover = cover;
      callback(null, docs)
    });
    ep.fail(callback);
    if (docs.metadata!=undefined && docs.metadata.length > 0) {
      setMaterialInfoMetadata(code, docs, function (err, metedata) {
        ep.emit('metedata', metedata);
      });
    } else {
      ep.emit('metedata', []);
    }
    if (docs.cover!=undefined && docs.cover.length > 0) {
      setMaterialInfoCover(code, docs, function (err, cover) {
        ep.emit('cover', cover);
      });
    } else {
      ep.emit('cover', []);
    }
  });
};
function setMaterialInfoCover(code, synthetic_docs, callback) {
  var ep = new EventProxy();
  var cover = synthetic_docs.cover;
  ep.after('cover_ready', synthetic_docs.cover.length, function () {
    return callback(null, cover);
  });
  ep.fail(callback);
  synthetic_docs.cover.forEach(function (m, i) {
    material.get(code, m.material_id, function (_err, _material) {
      m._doc.material = _material;
      cover[i] = m ;
      ep.emit('cover_ready');
    });
  });
}
function setMaterialInfoMetadata(code, synthetic_docs, callback) {
  var ep1 = new EventProxy();
  var metadata = synthetic_docs.metadata;
  ep1.after('metadata_ready', synthetic_docs.metadata.length, function () {
    return callback(null, metadata);
  });
  ep1.fail(callback);
  async.forEach(synthetic_docs.metadata,function (m, i) {
    material.get(code, m.material_id, function (_err, _material) {
      m._doc.material = _material;
      if (m.txtmaterial_id) {
        material.get(code, m.txtmaterial_id, function (_err, _txtmaterial) {
          m._doc.txtmaterial = _txtmaterial;
          metadata[i]= m;
          ep1.emit('metadata_ready');
        });
      } else if (m.widget && m.widget.length > 0) {
        var ep_widget = new EventProxy();
        var tmp_widget = m.widget;
        ep_widget.after('widget_ready', m.widget.length, function () {
          m._doc.widget = tmp_widget;
          metadata[i]= m;
          ep1.emit('metadata_ready');
        });
        m.widget.forEach(function (m_widget, k) {
          if (m_widget.action.material_id) {
            material.get(code, m_widget.action.material_id, function (_err, _material) {
              m_widget._doc.action.material = _material;

              if(m_widget.action.bg_material_id){
                material.get(code, m_widget.action.material_id, function (_err, _bg_material) {
                  m_widget._doc.action.bg_material = _bg_material;
                  tmp_widget[k]  = m_widget;
                  ep_widget.emit('widget_ready');
                });
              }else {
                tmp_widget[k]  = m_widget;
                ep_widget.emit('widget_ready');
              }
            });
          } else {
            tmp_widget[i] = m_widget;
            ep_widget.emit('widget_ready');
          }
        });
      } else {
        metadata[i]= m;
        ep1.emit('metadata_ready');
      }
    });
  }, function(){
    //console.log("ok");
    return;
  });

}




exports.saveThumb = function (code, thumb_pic, callback) {

};
exports.saveNameAndComment = function (code, synthetic_id, name, comment, uid, callback) {
  var _date = {
    name: name,
    comment: comment
  }
  synthetic.update(code, synthetic_id, _date, uid, function (err, result) {
    callback(err, result);
  });
}
exports.saveThumbAndMatedata = function (code, synthetic_id, cover, metadata, coverrows, covercols,syntheticName,syntheticComment,syntheticSign, user, callback) {

  var _data = {
    cover: cover,
    coverrows: coverrows,
    covercols: covercols,
    metadata: metadata,
    syntheticName: syntheticName,
    syntheticComment:syntheticComment,
    syntheticSign :syntheticSign
  }
  synthetic.update(code, synthetic_id, _data, user, function (err, result) {
    callback(err, result);
  });
};

exports.save = function (code, company_, uid_, item_, callback) {
  callback(null,{
    _id : item_.type
  });
}

// 获取一览
exports.list = function (code, keyword_,type,company_, start_, limit_, callback_) {

  var start = start_ || 0
    , limit = limit_ || 20
    , condition = {
      company: company_, valid: 1
    };
  if(type){
    if(type.indexOf(',')>-1){
      var type_list = type.split(',');
      var or = [];
      for(var i in type_list){
        or[i] = {type:type_list[i]};
      }
      condition.$or = or;
    }else{
      condition.type = type;
    }
  }

  // 检索用关键字
  if (keyword_&&keyword_.length>0) {
    keyword_ = util.quoteRegExp(keyword_);
    condition.name = new RegExp(keyword_.toLowerCase(),"i");
  }

  synthetic.total(code, condition, function (err, count) {
    if (err) {
      return callback_(new error.InternalServer(err));
    }

    synthetic.list(code, condition, start, limit, function (err, result) {
      if (err) {
        return callback_(new error.InternalServer(err));
      }
      appendCoverImage(code, result, function (err, synthetic_list) {
        // 添加用户信息
        user.appendUser(code, synthetic_list, "editby", function (err, result) {
          return callback_(err, {totalItems: count, items: result});
        });
      });

    });
  });
};
function appendCoverImage(code, docs, callback) {
  var ep = new EventProxy();
  var synthetic_list = [];
  ep.after('synthetic_list_ready', docs.length, function () {
    return callback(null, synthetic_list);
  });
  docs.forEach(function (obj, i) {
    if (obj.cover && obj.cover.length > 0) {
      material.get(code, obj.cover[0].material_id, function (_err, _material) {
        obj._doc.cover_material = _material;
        appendMetadataAndCover(code, obj.cover,obj.metadata,function(err,cover_list,metadata_list){
          obj._doc.cover =  cover_list;
          obj._doc.metadata =  metadata_list;
          synthetic_list[i] = obj;
          ep.emit('synthetic_list_ready');
        });
      });
    } else {
      obj._doc.cover_material = undefined;
      synthetic_list[i] = obj;
      ep.emit('synthetic_list_ready');
    }
  });
};
function appendMetadataAndCover(code, cover,metadata,callback){
  var ep = EventProxy.create('cover_list','metadata_list',function(cover_list,metadata_list){
    callback(null,cover_list,metadata_list);
  });
  appendAllCover(code, cover,function(err,cover_list){
    ep.emit('cover_list',cover_list);
  });
  appendAllmetadata(code, metadata,function(err,metadata_list){
    ep.emit('metadata_list',metadata_list);
  });

}
function appendAllmetadata(code, metadata,callback){
  var ep = new EventProxy();
  var metadata_list = [];
  ep.after('metadata_list_ready', metadata.length, function () {
    return callback(null, metadata_list);
  });
  metadata.forEach(function(metadata_obj,i){
    material.get(code, metadata_obj.material_id, function (_err, _material) {
      metadata_obj._doc.material = _material;
      metadata_list[i] = metadata_obj;
      ep.emit('metadata_list_ready');
    });
  });
}
function appendAllCover(code, cover,callback){
  var ep = new EventProxy();
  var cover_list = [];
  ep.after('cover_list_ready', cover.length, function () {
    return callback(null, cover_list);
  });
  cover.forEach(function(cover_obj,i){
    material.get(code, cover_obj.material_id, function (_err, _material) {
      cover_obj._doc.material = _material;
      cover_list[i] = cover_obj;
      ep.emit('cover_list_ready');
    });
  })
};
function appendCoverImage1(code, docs, callback) {
  var ep = new EventProxy();
  var synthetic_list = [];
  ep.after('synthetic_list_ready', docs.length, function () {
    return callback(null, synthetic_list);
  });
  docs.forEach(function (obj, i) {
    if (obj.cover && obj.cover.length > 0) {
      material.get(code, obj.cover[0].material_id, function (_err, _material) {
        obj._doc.cover_material = _material;
        synthetic_list[i] = obj;
        ep.emit('synthetic_list_ready');
      });
    } else {
      obj._doc.cover_material = undefined;
      synthetic_list[i] = obj;
      ep.emit('synthetic_list_ready');
    }
  });
};



// 删除
exports.remove = function (code, uid_, id_, callback_) {
  checkLayoutUse(code,id_,function(err,count){
    if(count==0){
      synthetic.remove(code, uid_, id_, function (err, result) {
        callback_(err, result);
      });
    }else{
      return callback_(new error.BadRequest(__("js.ctr.synthetic.used.error")));
    }
  })
};

function checkLayoutUse(code, id_,callback){
  layout.count(code, {"layout.page.tile.syntheticId":id_,"valid":1},function(err,count){
    callback(null,count);
  });
}

exports.copy = function (code, uid_, id_, callback_) {

  synthetic.copy(code, uid_, id_, function (err, result) {
    callback_(err, result);
  });
};
