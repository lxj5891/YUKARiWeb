var i18n    = require('i18n')
    , errors  = lib.core.errors
    , util    = require('util')
    , log     = lib.core.log
    , _       = require('underscore');

/**
 * 定义Error的函数
 * @param child
 * @param parent
 * @returns {*}
 */
function def(child, parent) {
    // 默认的父类使用NotFoundError, 因为Smart框架的AbstractError没对外开放，用它暂替代
    parent = parent || errors.NotFound;

    util.inherits(child, parent);

    return child;
}

exports.render = function(req_, res_, error, title, bright, user) {
    res_.render('error', {
        error: error
        , title: title ? title: '错误画面'
        , bright: bright? bright: ""
        , user: user? user: req_.session.user
    });
}

/**
 * 没有权限
 * @type {*}
 */
var NoPermissionError = function(msg){
    this.code = 10010;
    msg = msg || "没有权限";
    NoPermissionError.super_.call(this, msg, this.constructor);
};
exports.NoPermissionError = def(NoPermissionError);

/**
 * 没有阅览权限
 * @type {*}
 */
var NoViewError = function(msg){
    msg = msg || "没有阅览权限";
    NoViewError.super_.call(this, msg, this.constructor);
    this.code = 10011;
};
exports.NoViewError = def(NoViewError, exports.NoPermissionError);

/**
 * 没有编辑权限
 * @type {*}
 */
var NoEditError = function(msg){
    msg = msg || "没有编辑权限";
    NoEditError.super_.call(this, msg, this.constructor);
    this.code = 10012;
};
exports.NoEditError = def(NoEditError, exports.NoPermissionError);

/**
 * 没有下载权限
 * @type {*}
 */
var NoDownloadError = function(msg){
    msg = msg || "没有下载权限";
    NoDownloadError.super_.call(this, msg, this.constructor);
    this.code = 10013;
};
exports.NoDownloadError = def(NoDownloadError, exports.NoPermissionError);