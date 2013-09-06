var i18n    = require('i18n')
    , errors  = lib.core.errors
    , util    = lib.core.util
    , log     = lib.core.log
    , _ = require('underscore');

/**
 * 判断是否有管理权限
 * @param app_
 */
exports.isCanManage = function(app, uid) {
    // 创建者
    if(uid && app && app.create_user == uid)
        return true;
    // 管理者权限
    if(uid && app && app.permission && app.permission.admin) {
        var result = _.find(app.permission.admin, function(uid_){ return uid == uid_; } );
        if(result)
            return true;
    }

    return false;
};
/**
 * 判断是否有阅览权限
 * @param app_
 */
exports.isCanView = function(app, uid) {
    // 有管理权限就有阅览权限
    if(exports.isCanManage(app, uid))
        return true;

    // 编辑权限
    if(uid && app && app.permission && app.permission.edit) {
        var result = _.find(app.permission.edit, function(uid_){ return uid == uid_; } );
        if(result)
            return true;
    }
    return false;
};
/**
 * 判断是否有编辑权限
 * @param app_
 */
exports.isCanEdit = function(app, uid) {
    // 有管理权限就有编辑权限
    if(exports.isCanManage(app, uid))
        return true;

    // 编辑权限
    if(uid && app && app.permission && app.permission.edit) {
        var result = _.find(app.permission.edit, function(uid_){ return uid == uid_; } );
        if(result)
            return true;
    }
    return false;
};
/**
 * 判断是否有下载权限
 * @param app_
 */
exports.isCanDownload = function(app_, uid) {
    // 有管理权限就有下载权限
    if(this.isCanManage(app_, uid))
        return true;

    if(uid && app_ && app_.downloadId && app_.permission && app_.permission.download) {
        var result = _.find(app_.permission.edit, function(uid_){ return uid == uid_; } );
        if(result)
            return true;
    }
    return false;
};

exports.getDownloadURL = function(req_, app_) {
    if(!app_.downloadId)
        return null;

    if(!(req_.session && req_.session.user))
        return null;

    var uid = req_.session.user._id;
    if(!exports.isCanDownload(app_, uid))
        return null;

    var app_id = app_._id;
    var protocol = req_.protocol;
    var host = req_.host;
    var port = req_.app.get("port");
    port = ( port == 80 || port == 443 ? '' : ':' + port );// fixed

    var url_ = protocol + "://" + host + port + "/download/" + app_id + "/"+uid+"/app.plist";
    return "itms-services://?action=download-manifest&url=" + url_;
}