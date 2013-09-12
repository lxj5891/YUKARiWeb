var async     = require('async')
  , _         = require('underscore')
  , check     = require('validator').check
  , layout    = require('../modules/mod_layout')
  , history   = require('../modules/mod_layout_publish')
  , synthetic = require('../controllers/ctrl_synthetic')
  , mq        = require('../controllers/ctrl_mq')
  , user      = lib.ctrl.user
  , error     = lib.core.errors
  , log       = lib.core.log
  , cutil     = require('../core/contentutil')
  , util     = lib.core.util;


exports.add = function(company_,uid_,layout_,callback_){
  layout_.createat = new Date();
  layout_.createby = uid_;
  layout_.editat = new Date();
  layout_.editby = uid_;
  layout_.company = company_;
  layout_.publish = 0;
  layout_.status = 1;

  layout.add(layout_,function(err, result){
    if (err) {
      return callback_(new error.InternalServer(err));
    }

    setSyntheticIntoLayout(result, function(e){
      return callback_(e, result);
    });
  });
};

exports.update = function (company_, uid_, layout_, callback_) {
  var condition = {
  company: company_,
  _id: layout_._id
  };
  delete layout_._id;

  layout.update(condition, layout_, function (err, result) {
    if (err) {
      return callback_(new error.InternalServer(err));
    }

    setSyntheticIntoLayout(result, function(e){
      // Merge TopMenu picture
      mergeTopMenuImage(result);
      // Merge CaseMenu picture
      mergeCaseMenuImage(result);

      return callback_(e, result);
    });

  });
};

exports.get = function (company_, uid_, layoutId_, callback_) {
  var condition = {
    _id: layoutId_,
    company: company_
  };
  layout.get(condition, function (err, result) {
    if (err) {
      return callback_(new error.InternalServer(err));
    }
//    return callback_(err, result);
//    console.log(result.page);

    setSyntheticIntoLayout(result, function(e){
      return callback_(e, result);
    });
  });
};

function setSyntheticIntoLayout(layout_, callback_){
  var mainTask = function(page, mainCB){
    var subTask = function(tile, subCB){
       synthetic.getSyntheticById(tile.syntheticId, function(_err, _synthetic){
        tile._doc.synthetic = _synthetic;
        subCB(_err);
      });
    };
    async.forEach(page.tile, subTask, mainCB);
  };

  async.forEach(layout_.layout.page, mainTask, callback_);
}

exports.remove = function(company_, uid_, id_, layoutId_ , callback_){

  if (layoutId_) {
    // remove publishlayout
    history.remove(uid_, id_, function(err, result){
      if (err) {
        return callback_(new error.InternalServer(err));
      }

      layout.update({company: company_,_id: layoutId_}, {publish: 0}, function(err1, result1){
        callback_(err1, result);
      });
    });

  } else {
    // remove layout
    layout.get({company: company_,_id: id_}, function (err, result) {

      if ( uid_ != result._doc.createby ) {

        // 権限チェック
        callback_({code:0, message: __("js.ctr.delete.auth.error")});

      } else {

        layout.remove(uid_, id_, function(err1, result1){
          callback_(err1, result1);
        });
      }
    });
  }
};

exports.copy = function(uid_, id_, callback_){

  layout.copy(uid_, id_, function(err, result){
    callback_(err, result);
  });
};

exports.updateStatus = function (company_, uid_, layout_, callback_) {

  var condition = {
    company: company_,
    _id: layout_._id
  };
  delete layout_._id;

  // 承認
  if (layout_.status == 4) {

    layout.get(condition, function (err, result) {
      if ( uid_ != result._doc.confirmby ) {
        // 権限チェック
        callback_({code:0, message: __("js.ctr.confirm.auth.error")});

      } else {

        layout.update(condition, layout_, function (err, result) {
          if (err) {
            return callback_(new error.InternalServer(err));
          }
          // ADD PublishLayout
          publishLayout(condition, function(e) { callback_(e, result); });

        });
      }
    });
  // 申請、否認
  }  else {
    if (layout_.status == 2 && !isLayoutComplete(layout_)) {
      // 権限チェック
      callback_({code:0, message: __("js.ctr.layout.complete.error")});
    } else {

      layout.update(condition, layout_, function (err, result) {
        if (err) {
          return callback_(new error.InternalServer(err));
        }
        callback_(err, result);

      });
    }
  }
};

function publishLayout(layout_, callback_) {
  var condition = {
    company: layout_.company,
    layoutId: layout_._id
  };

  exports.get(condition.company, "", condition.layoutId, function (err1, result1) {

    if (err1) {
      return callback_(new error.InternalServer(err1));
    }
    result1 = result1.toJSON();
    // result1 => layout
    var layout_ = {
      confirmat : result1.confirmat,
      confirmby : result1.confirmby,
      editat :  result1.editat,
      editby :  result1.editby,
      createat :  result1.createat,
      createby :  result1.createby,
      layout : result1.layout
    };

    history.get(condition, function (err2, result2) {
      // get publishLayout
      if (err2) {
        return callback_(new error.InternalServer(err2));
      }

      // 公式ありの場合
      if (result2 && result2._id) {
        layout_.version = result2.history.length + 1;

         history.update(result2._id, layout_, function(err3, result3){
           return callback_(err3, result3);
         });

      } else {
        layout_.version = 1;

        var publishLayout = {
          company : condition.company,
          layoutId : condition.layoutId,
          active: layout_,
          history : [layout_]
        };

        history.add(publishLayout, function (err3, result3) {
          return callback_(err3, result3);
        });
      }

    });
  });
}
//////////////////////////////////////////////////

// 获取一览
exports.list = function(keyword_,company_, start_, limit_, uid, status, callback_) {

  var start = start_ || 0
    , limit = limit_ || 20
    , condition = {
      company: company_,
      valid: 1
    };

  if (status == 21) {
    condition.status = 2;
    condition.editby = uid;
  } else if(status == 22) {
    condition.status = 2;
    condition.confirmby = uid;
  }
  if(keyword_ && keyword_.length > 0){
    keyword_ = util.quoteRegExp(keyword_);
    condition["layout.name"] = new RegExp(keyword_.toLowerCase(),"i");
  }

  layout.total(condition, function(err, count){
    if (err) {
      return callback_(new error.InternalServer(err));
    }

    layout.list(condition, start, limit, function(err, result1){
      if (err) {
        return callback_(new error.InternalServer(err));
      }

      if (status == 21) {
        user.appendUser(result1, "confirmby", function(err, result){
          return callback_(err, {totalItems: count, items:result1});
        });
      } else {
        user.appendUser(result1, "editby", function(err, result){
          return callback_(err, {totalItems: count, items:result1});
        });
      }
    });
  });
};

exports.publishList = function(keyword,company_, start_, limit_, callback_) {

  var start = start_ || 0
    , limit = limit_ || 20
    , condition = {
      company: company_,
      valid: 1
    };
  if (keyword && keyword.length > 0) {
    keyword_ = util.quoteRegExp(keyword_);
    condition["active.layout.name"] = new RegExp(keyword.toLowerCase(), "i");
  }


  history.total(condition, function(err, count){
    if (err) {
      return callback_(new error.InternalServer(err));
    }

    history.activeList(condition, start, limit, function(err, result){
      if (err) {
        return callback_(new error.InternalServer(err));
      }

      var subTask = function(item, subCB){

        user.getUserById(item.active.editby, function(err, u_result) {
          item._doc.active.user = u_result;
          subCB(err);
        });
      };
      async.forEach(result, subTask, function(err_){
        return callback_(err, {totalItems: count, items:result});
      });
    });
  });
};

exports.history = function(company_, start_, limit_, callback_) {

  var start = start_ || 0
    , limit = limit_ || 20
    , condition = {
      company: company_,
      valid: 1
    };

  history.total(condition, function(err, count){
    if (err) {
      return callback_(new error.InternalServer(err));
    }

    history.list(condition, start, limit, function(err, result){
      if (err) {
        return callback_(new error.InternalServer(err));
      }

      var subTask = function(item, subCB){

        user.getUserById(item.active.editby, function(err, u_result) {
          item._doc.active.user = u_result;
          subCB(err);
        });
      };
      async.forEach(result, subTask, function(err_){
        return callback_(err, {totalItems: count, items:result});
      });
    });
  });
};

/**
 * 合并TopMenu图片
 * @param layout
 * @returns {{id: *, collection: string, key: string, files: Array}}
 */
var mergeTopMenuImage = function(layout) {
  var result = {
    id: layout._id               // layoutId
    , collection: "layouts"      // 数据库中的表名
    , key: "layout.image.imageH" // 放到表中的这个结构中
    , files: []
  };

  var layout_width = cutil.getLayoutWidth();
  var layout_height = cutil.getLayoutHeight();
  var height = 0;
  _.each(layout.layout.page, function(page, page_index){
    if(page.type == 1) {// 横,top menu image
      var page_count = Math.ceil(page.tile.length / 9);
      height = page_count * layout_height;

      _.each(page.tile, function(tile, tile_index) {
        tile = fixDoc(tile);
        if(tile.synthetic && tile.synthetic.cover && tile.synthetic.cover.length > 0) {
          var c = fixDoc(tile.synthetic.cover[0]);
          if(c.material) {
            var area = cutil.covertToArea(tile);
            result.files.push({
              fid: c.material.fileid,
              x: area.x + "",
              y: area.y + "",
              w: area.w + "",
              h: area.h + ""
            });
          }
        }
      });
    }
  });

  // Set Width and Height
  result.width = layout_width + "";
  result.height = height + "";

  //log.out("debug", result);
  mq.joinImage(result);
};

/**
 * 合并CaseMenu图片
 * @param layout
 * @returns {*}
 */
var mergeCaseMenuImage = function(layout) {
  var result = {
    id: layout._id               // layoutId
    , collection: "layouts"      // 数据库中的表名
    , key: "layout.image.imageV" // 放到表中的这个结构中
    , files: []
  };

  var width = 0;
  _.each(layout.layout.page, function(page, page_index){
    if(page.type == 2) {// 竖,case menu image
      _.each(page.tile, function(tile, tile_index) {
        tile = fixDoc(tile);
        width += cutil.getCaseMenuItemWidth();

        if(tile.synthetic && tile.synthetic.cover && tile.synthetic.cover.length > 0) {
          var c = fixDoc(tile.synthetic.cover[0]);
          if(c.material) {
            var area = cutil.covertToAreaForCaseMenu(tile_index);
            result.files.push({
              fid: c.material.fileid,
              x: area.x + "",
              y: area.y + "",
              w: area.w + "",
              h: area.h + ""
            });
          }
        }
      });
    }
  });

  // Set Width and Height
  result.width = width + "";
  result.height = cutil.getCaseMenuItemHeight() + "";

  if(result.files.length > 0) {
    //log.out("debug", result);
    mq.joinImage(result);
  }
};

function fixDoc(data) {
  if(!data)
    return;
  return data._doc ? data._doc : data;
}

function isLayoutComplete(layout){
  if(!layout){
    return false;
  }

  if(!layout.layout){
    return false;
  }

  if(_.isEmpty(layout.layout.name)){
    return false;
  }

  if(layout.layout.page.length < 2){
    return false;
  }

  var isComplete = false;
  _.each(layout.layout.page,function(page){
    if(page.tile.length<=0){
      isComplete = false;
      return;
    }
    if(page.type == 1){//横
      if(page.tile.length%9 != 0){
        isComplete = false;
        return;
      }
    }
    if(page.type == 2){//縦

    }
    isComplete = isComplete && !_.any(page.tile,function(tile){
      return tile.colspan > 0 && tile.rowspan > 0 && _.isEmpty(tile.syntheticId);
    });
  });

  return isComplete;
}