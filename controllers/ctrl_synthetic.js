var _           =smart.util.underscore
  , synthetic   = require('../modules/mod_synthetic.js')
  , layout      = require('../modules/mod_layout')
  , material    = require('../modules/mod_material.js')
  , tag         = require('./ctrl_tag')
  , EventProxy  = require('eventproxy')
  , user        = smart.ctrl.user
  , error       = smart.framework.errors
  , async       = smart.util.async
  , company     = smart.ctrl.company
  , util        = smart.framework.util;


exports.getSyntheticById = function (code, synthetic_id, callback) {
  if(synthetic_id&&synthetic_id.length<20){
    callback(null,{
      type:synthetic_id
    });
    return;
  }
  synthetic.get(code, synthetic_id, function (err, docs) {
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

//getSyntheticById_

exports.getSyntheticById_ = function (handler, callback) {
  if(handler.params.synthetic_id && handler.params.synthetic_id.length<20){
    return callback(null,{
      items:{
        type:handler.params.synthetic_id
      }
    });
  }

  var tasks = [];

  // 1.
  var getSynthetic = function(cb){
    synthetic.get(handler.code,handler.params.synthetic_id,function(err,docs){
      cb(err,docs);
    });
  };
  tasks.push(getSynthetic);

  // 2.
  var setMetadata = function(doc,cb){
    async.each(doc.metadata,function(item,done){
      material.get(handler.code, item.material_id, function (err, material) {
        if(!err){
          item._doc.material = material;
        }
        done(err);
      });
    },function(err){
      cb(err,doc);
    });
  };
  tasks.push(setMetadata);

  // 3.
  var setTxtMetaAndWidget = function(doc,cb){
    async.each(doc.metadata,function(item,done){
      if (item.txtmaterial_id) {
        material.get(handler.code, item.txtmaterial_id, function (err, txtmaterial) {
          if(!err){
            item._doc.txtmaterial = txtmaterial;
          }
          done(err);
        });
      }else if(item.widget && item.widget.length > 0) {
        async.each(item.widget,function(item,done){
          if (item.action.material_id) {
            material.get(handler.code, item.action.material_id, function (err, material) {
              if(!err){
                item._doc.action.material = material;

                if(item.action.bg_material_id){
                  material.get(handler.code, item.action.bg_material_id, function (err, material) {
                    if(!err){
                      item._doc.action.bg_material = material;
                    }
                    done(err);
                  });
                }else{
                  done();
                }
              }else{
                done(err);
              }
            });
          }else{
            done();
          }
        });
      }
    },function(err){
      cb(err,doc);
    });
  };
  tasks.push(setTxtMetaAndWidget);

  // 4.
  var setCoverInfo = function(doc,cb){
    async.each(doc.cover,function(item,done){
      material.get(handler.code, item.material_id, function (err, material) {
        if(!err){
          item._doc.material = material;
        }
        done(err);
      });
    },function(err){
      cb(err,doc);
    });
  };
  tasks.push(setCoverInfo);

  async.waterfall(tasks,function(err,doc){
    if(err){
      err = new error.InternalServer(err);
    }
    callback(err,doc);
  });

};

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
exports.saveNameAndComment_ = function (handler, callback) {
  var data = {
    name: handler.params.name,
    comment: handler.params.comment
  }
  synthetic.update(handler.code, handler.params.synthetic_id, data, handler.uid, function (err, result) {
    callback(err, result);
  });
}

exports.saveThumbAndMatedata = function (code, synthetic_id, cover, metadata, coverrows, covercols,syntheticName,syntheticComment,syntheticSign,syntheticOptions, user, callback) {

  var _data = {
    cover: cover,
    coverrows: coverrows,
    covercols: covercols,
    metadata: metadata,
    syntheticName: syntheticName,
    syntheticComment:syntheticComment,
    syntheticSign :syntheticSign,
    opts : syntheticOptions
  }

  if (synthetic_id.length < 20) {

    synthetic.add(code, synthetic_id ,user ,function(err,result){

      if (err) {
        callback(err);
      }

      if (!result) {
        callback(null, null);
      }

      synthetic.update(code, result._id, _data, user._id, function (err, result) {

        if (err) {
          callback(err);
        }

        if (!result) {
          callback(null, null);
        }

        callback(null, result);

      });

    });
  } else {
    synthetic.update(code, synthetic_id, _data, user._id, function (err, result) {

      if (err) {
        callback(err);
      }

      if (!result) {
        callback(null, null);
      }

      callback(null, result);

    });

  }


};
exports.saveThumbAndMatedata_ = function (handler, callback) {

  var data = {
    cover             : handler.params.cover
    , coverrows       : handler.params.coverrows
    , covercols       : handler.params.covercols
    , metadata        : handler.params.metadata
    , syntheticName   : handler.params.syntheticName
    , syntheticComment: handler.params.syntheticComment
    , syntheticSign   : handler.params.syntheticSign
    , opts            : handler.params.options
  }

  if (handler.params.synthetic_id.length < 20) {
    var type = handler.params.synthetic_id;
    synthetic.add(handler.code ,type  ,handler.user ,function(err,result){

      if(err){
        callback(new error.InternalServer(err));
      }else{
        synthetic.update(handler.code, result._id, data, handler.uid, function(err,result){
          if(err){
            err = new err.InternalServer(err);
          }
          callback(err,{items:result});
        });
      }
    });
  } else {
    synthetic.update(handler.code, handler.params.synthetic_id._id, data, handler.uid, function(err,result){
      if(err){
        err = new err.InternalServer(err);
      }
      callback(err,{items:result});
    });
  }
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

    synthetic.getList(code, condition, start, limit, function (err, result) {
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
exports.list_ = function (handler, callback_) {

  console.log(handler.params);

  var start   = handler.params.start || 0
    , limit   = handler.params.limit || 20
    , type    = handler.params.type
    , keyword = handler.params.keyword;

  var tasks = [];
  handler.addParams("code",handler.code)  ;
  //1.构造condition
  var generateCondition = function(cb){
    company.getByCode(handler,function(err,comp){
      var condition = {company:comp._id,valid:1};
      if(!err){
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
        if (keyword&&keyword.length>0) {
          keyword = util.quoteRegExp(keyword);
          condition.name = new RegExp(keyword.toLowerCase(),"i");
        }
      }
      cb(err,condition);
    });
  };
  tasks.push(generateCondition);

  //2.获取满足条件的个数
  var getTotalCount = function(condition,cb){
    synthetic.total(handler.code, condition, function (err, count) {
      cb(err,condition,count);
    });
  };
  tasks.push(getTotalCount);

  //3.获取元素
  var getSyntheticData = function(condition,count,cb){
    synthetic.getList(handler.code, condition, start, limit, function (err, synthetics) {
      cb(err,count,synthetics);
    });
  };
  tasks.push(getSyntheticData);

  //4.append cover image
  var appendCoverImage = function(count,synthetics,cb){
    async.each(synthetics,function(item,done){
      if (item.cover && item.cover.length > 0) {
        material.get(handler.code,item.cover[0].material_id,function(err,material){
          if(!err){
            item._doc.cover_material = material;
          }
          done(err);
        });
      }else{
        item._doc.cover_material = undefined;
        done();
      }
    },function(err){
      cb(err,count,synthetics);
    });
  };
  tasks.push(appendCoverImage);

  //5.append metadata
  var appendMetadata = function(count,synthetics,cb){
    async.each(synthetics,function(item,done){
      async.each(item.metadata,function(meta,done){
        material.get(handler.code, meta.material_id, function (err, material) {
          if(!err){
            meta._doc.material = material;
          }
          done(err);
        });
      },function(err){
        done(err);
      });
    },function(err){
      cb(err,count,synthetics);
    });
  };
  tasks.push(appendMetadata);

  //6.append cover
  var appendCover = function(count,synthetics,cb){
    async.each(synthetics,function(item,done){
      async.each(item.cover,function(cover,done){
        material.get(handler.code, cover.material_id, function (err, material) {
          if(!err){
            cover._doc.material = material;
          }
          done(err);
        });
      },function(err){
        done(err);
      });
    },function(err){
      cb(err,count,synthetics);
    });
  };
  tasks.push(appendCover);

  //7.append edit by
  var appendEditBy = function(count,synthetics,cb){
    user.appendUser(handler.code, synthetics, "editby", function (err, result) {
      cb(err,count,result);
    });
  };
  tasks.push(appendEditBy);

  //END:all things done
  var final = function(err,count,synthetics){
    if(err){
      err = new error.InternalServer(err);
    }
    callback_(err, {totalItems: count, items: synthetics});
  };

  async.waterfall(tasks,final);

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
exports.remove_ = function (handler, callback_) {

  checkLayoutUse(handler.code,handler.params.id,function(err,count){
    if(count==0){
      synthetic.remove(handler.code, handler.uid, handler.params.id, function (err, result) {
        if(err){
          err = new err.InternalServer(err);
        }
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
exports.copy_ = function (handler, callback_) {

  synthetic.copy(handler.code, handler.uid, handler.params.id, function (err, result) {
    if(err){
      err = new err.InternalServer(err);
    }
    callback_(err, result);
  });
};
