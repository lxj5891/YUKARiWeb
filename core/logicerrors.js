var __    = require('i18n').__
    , errors  = lib.core.errors
    , util    = require('util')
    , json      = lib.core.json
    , log     = lib.core.log
    , _       = require('underscore');

/**
 * 定义Error的函数
 * @param child
 * @param parent
 * @returns {*}
 */

function def(code, default_msg, parent){
  // 默认的父类使用NotFoundError, 因为Smart框架的AbstractError没对外开放，用它暂替代
  parent = parent || errors.NotFound;

  var ChildError = function(msg_){
    msg_ = msg_ || default_msg;
    ChildError.super_.call(this, msg_, this.constructor);
    this.code = code
  };

  util.inherits(ChildError, parent);
  return ChildError;
}

/**
 * 返回错误画面
 * @param req_
 * @param res_
 * @param error
 * @param title
 * @param bright
 * @param user
 */
exports.render = function(req_, res_, error, title, bright, user) {
  res_.render('error', {
      error: error
      , title: title ? title: '错误画面'
      , bright: bright? bright: ""
      , user: user? user: req_.session.user
  });
}
/**
 * 返回JSON的Response
 * @param res_
 * @param error
 */
exports.sendJSON = function(res_, error, msg) {
  var e;
  if (typeof error == "object") { // 实例化后的error
    e = error;
    if(msg) e.message = msg;
  } else { // error定义时，需要实例化
    e = new error(msg);
  }

  json.sendError(res_, e);
};

// 公司ID不存在
exports.NoCompany = def(1000, __("error.company.noexist"));//""

