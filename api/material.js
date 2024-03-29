var  _               = smart.util.underscore
  , response            = smart.framework.response
  , context         = smart.framework.context
  , errors          = smart.framework.errors
  , log             = smart.framework.log
  , mod_group       = smart.ctrl.group
  , utils           = require('../core/utils')
  , material        = require('../controllers/ctrl_material')
  , layout_publish  = require('../modules/mod_layout_publish')
  , ctl_layout      = require('../controllers/ctrl_layout');



/**
 * 获取文件一览
 * @param req_
 * @param res_
 */
exports.list = function(req, res) {

  var user = req.session.user;
  var handler = new context().bind(req,res);
  if(!canUpdate(user)){
    return noAccessResponse(res);
  }

  material.list(handler, function(err, result) {
    log.operation("finish: find list: ",handler.uid);
    response.send(res,err,result);
  });
};

// Add new file
exports.add = function(req_, res_) {
  var handler = new context().bind(req_,res_);
  log.operation("begin: add an file ", handler.uid);

  material.add(handler,function(err,result){
    log.operation("finish: add an file ",handler.uid);
    response.send(res_,err,result);
  });
}

exports.updatefile = function(req_, res_) {
  var handler = new context().bind(req_,res_);

  if(!canUpdate(req_.session.user)){
    return noUpdateResponse(res_);
  }
  console.log(handler.params);
  material.updatefile(handler ,function(err, result){
    log.operation("finish: update an file ",handler.uid);
    response.send(res_,err,result);


  });

}


// Update
exports.edit = function(req_, res_) {
  var handler = new context().bind(req_,res_);
  handler.addParams("updateFile",req_.body.updateFile);
  if(!canUpdate(req_.session.user)){
    return noUpdateResponse(res_);
  }
  material.edit(handler,function(err,result){

    log.operation("finish: edit an file ",handler.uid);
    response.send(res_,err,result);
  });


};

// Download a file
exports.download = function(req_, res_, isPublish) {
  var uid = req_.session.user._id
    , target = req_.query.target // temp
    , file_name = req_.query.file // temp
    , user_ = req_.session.user
    , code = req_.session.user.companycode;

    if(target == null) {
      var err = new errors.BadRequest(__("api.param.error","target"));
      res_.send(err.code, response.errorSchema(err.code, err.message));
      return;
    }
    if(file_name == null) {
      var err = new errors.BadRequest(__("api.param.error","filename"));
      res_.send(err.code, response.errorSchema(err.code, err.message));
      return;
    }


    function getLayout(err, layout) {
      if (err)
        return res_.send(err.code, response.errorSchema(err.code, err.message));
      if (!layout) {
        var err = new errors.InternalServer(__("api.layout.id.error") + target);
        return res_.send(err.code, response.errorSchema(err.code, err.message));
      }

      var file_id = undefined;

      if(file_name == "iPad_menu.png") {
        if(layout.layout.image && layout.layout.image.imageH)
          file_id = layout.layout.image.imageH;
      } else if(file_name == "case_menu.png") {
        if(layout.layout.image && layout.layout.image.imageV)
          file_id = layout.layout.image.imageV;
      } else if(file_name.indexOf("img_case") >= 0) {
        var index_str = file_name.replace("img_case", "");
        if(index_str.indexOf(".png"))
          index_str = index_str.replace(".png", "");
        var case_index = parseInt(index_str) - 1;
        for(var i in layout.layout.page) {
          var page = fixDoc(layout.layout.page[i]);
          if(page.type == 2) {// 竖屏
            if(page.tile[case_index]) {
              var tile = fixDoc(page.tile[case_index]);
              file_id = getMetadataFileId(tile, 0);
            }
            break;
          }
        }
      } else {
        var ids = file_name.split("-");
        if(ids.length < 4) {
          var err = new errors.BadRequest(__("api.param.error","filename"));
          return res_.send(err.code, response.errorSchema(err.code, err.message));
        }

        // param 1
        var prefix = ids[0];

        // param 2
        var page_index = parseInt(ids[1]);
        if(! layout.layout.page[page_index]) {
          var err = new errors.NotFound(__("api.file.name.error") + file_name);
          return res_.send(err.code, response.errorSchema(err.code, err.message));
        }
        var page = fixDoc(layout.layout.page[page_index]);

        // param 3
        var tile_index = parseInt(ids[2]);
        if(! page.tile[tile_index]) {
          var err = new errors.NotFound(__("api.file.name.error") + file_name);
          return res_.send(err.code, response.errorSchema(err.code, err.message));
        }
        var tile = fixDoc(page.tile[tile_index]);

        // param 3
        if(ids[3].indexOf(".png") > 0)
          ids[3] = ids[3].replace(".png", "");

        // param 4
        if(ids[4]) {
          if(ids[4].indexOf(".png") > 0)
            ids[4] = ids[4].replace(".png", "");
          if(ids[4].indexOf(".mp4") > 0)
            ids[4] = ids[4].replace(".mp4", "");
        }

        if(prefix == "widget_image" || prefix == "widget_movie") {
          var metadata_index = parseInt(ids[3]);
          var widget_index = parseInt(ids[4]);
          file_id = getWidgetFileId(tile, metadata_index, widget_index);
        } else if(prefix == "widget_background"){
          var metadata_index = parseInt(ids[3]);
          var widget_index = parseInt(ids[4]);
          file_id = getWidgetBackgroundFileId(tile, metadata_index, widget_index);
        } else if(prefix == "topmenu") {
          var cover_index = parseInt(ids[3]);
          file_id = getCoverImageFileId(tile, cover_index);
        } else if(prefix == "imageWithThumb" && file_name.indexOf("pic") > 0) { // 带动画效果背景图片
          var metadata_index = parseInt(ids[3].replace("pic", ""));
          file_id = getMetadataFileId(tile, metadata_index);
        } else if(prefix == "imageWithThumb" && file_name.indexOf("txt") > 0) { // 带动画效果文字图片
          var metadata_index = parseInt(ids[3].replace("txt", ""));
          file_id = getMetadataTxtFileId(tile, metadata_index);
        } else if(prefix == "imageWithThumb" || prefix == "gallery" || prefix == "solutionmap" || prefix == "introduction") {              // 普通image和画廊
          var metadata_index = parseInt(ids[3]);
          file_id = getMetadataFileId(tile, metadata_index);
        }
      }

      if(!file_id) {
        var err = new errors.NotFound(__("api.file.name.error") + file_name);
        return res_.send(err.code, response.errorSchema(err.code, err.message));
      }

      dbfile.download(code, file_id, function(err, doc, info){
        if (err) {
          return res_.send(err.code, response.errorSchema(err.code, err.message));
        } else {
          res_.header('Content-Length', info.length);
          res_.attachment(file_name);
          res_.contentType("application/zip");
          return res_.send(doc);
        }
      });
    }

    if(isPublish) { // 公开Layout的取得
      layout_publish.get(code, {_id: target}, function (err, result) {
        if (err) {
          var err = new errors.InternalServer(__("api.file.name.error") + file_name);
          return res_.send(err.code, response.errorSchema(err.code, err.message));
        }

        mod_group.getAllGroupByUid(code, uid, function(err, groups){
          if(err){
            var error = new errors.InternalServer(err);
            return res_.send(error.code, response.errorSchema(error.code, error.message));
          }

          // 公开先check
          if(!utils.canDownloadPublishContents(user_, groups, result)){
            return noAccessResponse(res_);
          } else {
            getLayout(err, (result && result.active) ? result.active : null);
          }
        });
      });
    } else { // 非公开Layout的取得
      if(!utils.canDownloadDraftContents(user_)){
        return noAccessResponse(res_);
      }

      ctl_layout.get(code, uid, target, function(err, layout) {
        getLayout(err, layout);
      });
    }
};

function getWidgetFileId(tile, metadata_index, widget_index) {
  if(!tile.synthetic || !tile.synthetic.metadata[metadata_index])
    return;

  var meta = tile.synthetic.metadata[metadata_index];
  if(!meta.widget || !meta.widget[widget_index])
    return;

  var widget = fixDoc(meta.widget[widget_index]);
  if(!widget.action || !widget.action.material)
    return;

  return widget.action.material.fileid;
}

function getWidgetBackgroundFileId(tile, metadata_index, widget_index) {
  if(!tile.synthetic || !tile.synthetic.metadata[metadata_index])
    return;

  var meta = tile.synthetic.metadata[metadata_index];
  if(!meta.widget || !meta.widget[widget_index])
    return;

  var widget = fixDoc(meta.widget[widget_index]);
  if(!widget.action || !widget.action.bg_material)
    return;

  return widget.action.bg_material.fileid;
}


function getCoverImageFileId(tile, cover_index) {
  if(tile.synthetic && tile.synthetic.cover[cover_index] && tile.synthetic.cover[cover_index]) {
    var cover = fixDoc(tile.synthetic.cover[cover_index]);

    if(cover.material)
      return cover.material.fileid;
  }
  return undefined;
}

function getMetadataTxtFileId(tile, metadata_index) {
  if(tile.synthetic && tile.synthetic.metadata[metadata_index]) {
    var meta = fixDoc(tile.synthetic.metadata[metadata_index]);
    if(meta.txtmaterial)
      return meta.txtmaterial.fileid;
  }
  return undefined;
}

function getMetadataFileId(tile, metadata_index) {
  if(tile.synthetic && tile.synthetic.metadata[metadata_index]) {
    var meta = fixDoc(tile.synthetic.metadata[metadata_index]);
    if(meta.material)
      return meta.material.fileid;
  }
  return undefined;
}

function fixDoc(data) {
  return data._doc? data._doc: data;
}

// Delete a file
exports.remove = function(req_, res_) {
  var handler = new context().bind(req_,res_);
  log.operation("begin: remove an file ", handler.uid);

  if(!canUpdate(req_.session.user)){
    return noUpdateResponse(res_);
  }
  material.remove(handler,function(err,result){
    log.operation("finish: remove an file", handler.uid);
    response.send(res_,err,result);
  });
};

// author check

// 素材的增删改查都只有content作成者有权限，增删改查暂用一个check
function canUpdate(user_){
  return utils.hasContentPermit(user_);
}

function noAccessResponse(res_){
  var err= new errors.Forbidden(__("js.common.access.check"));
  return res_.send(err.code, response.errorSchema(err.code, err.message));
}

function noUpdateResponse(res_){
  var err= new errors.Forbidden(__("js.common.update.check"));
  return res_.send(err.code, response.errorSchema(err.code, err.message));
}