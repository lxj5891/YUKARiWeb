/**
 * @file 工具类，权限判断用等共同方法
 * @author r2space@gmail.com
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var _     = smart.util.underscore
  , check = smart.util.validator.check
  , error = smart.framework.errors;


/**
 * 确认是否可以发送通知
 * @param user 用户对象
 * @returns {boolean} 可以：true
 */
exports.hasNoticePermit = function(user) {
  return exports.isSuperAdmin(user)
    || exports.isAdmin(user)
    || (exports.isCommonUser(user) && user.extend.authority && user.extend.authority.notice == 1);
}

/**
 * 是否是超级用户（DEV）
 * @param {Object} user 用户对象
 * @returns {boolean} 判断结果
 */
exports.isSuperAdmin = function(user) {
  return user.extend.type == 3;
}


/**
 * 是否是普通用户
 * @param {Object} user 用户对象
 * @returns {boolean} 判断结果
 */
exports.isCommonUser = function(user){
  return user.extend.type == 0;
}

/**
 * 是否是顾客管理员
 * @param {Object} user 用户对象
 * @returns {boolean} 判断结果
 */
exports.isAdmin = function(user) {
  return user.extend.type == 1;
}

/**
 * 是否是DA管理员
 * @param {Object} user 用户对象
 * @returns {boolean} 判断结果
 */
exports.isSystemAdmin = function(user) {
  return user.extend.type == 2;
}

// -------------- 以下未整理



exports.hasContentPermit = function(user_){
  return exports.isSuperAdmin(user_) || (exports.isCommonUser(user_) && user_.extend.authority && user_.extend.authority.contents == 1);
}

exports.hasApprovePermit = function(user_){
  return exports.isSuperAdmin(user_) || (exports.isCommonUser(user_) && user_.extend.authority &&  user_.extend.authority.approve == 1);
}

exports.canDownloadDraftContents = function(user_){
  return exports.hasApprovePermit(user_);
}

exports.canDownloadPublishContents = function(user_, joinGroup, publishLayout_){

  // 承认者可以下载
  if(publishLayout_.active.confirmby == user_._id)
  {
    return true;
  }

  // 对所有人公开
  if (publishLayout_.active.viewerGroups.length == 0 && publishLayout_.active.viewerUsers.length == 0) {
    return true;
  };

  // 公开先 人
  if(_.contains(publishLayout_.active.viewerUsers, user_._id)){
    return true;
  }

  // 公开先 组
  var viewGroups = publishLayout_.active.viewerGroups;
  for(var i = 0; i < joinGroup.length; i ++){
    var gid = joinGroup[i]._id.toString();
    if(_.contains(viewGroups, gid)){
      return true;
    }
  }

  return false;
}

exports.checkUser = function(user,callback_){
  try {
    if (user.password != undefined) {
      check(user.password, __("js.ctr.check.user.password.min")).notEmpty();
      check(user.password, __("js.ctr.check.user.password.max")).notEmpty().len(1,20);
    }

    if (user.userName != undefined) {
      check(user.userName, __("js.ctr.check.user.uid.min")).notEmpty();
      check(user.userName, __("js.ctr.check.user.uid.max")).notEmpty().len(3,30);
      check(user.userName, __("js.ctr.check.user.uid.ismail")).notEmpty().isEmail();
    }

    if (user.first != undefined) {
      check(user.first, __("js.ctr.check.user.name.min")).notEmpty();
      check(user.first, __("js.ctr.check.user.name.max")).notEmpty().len(1,20);
    }

    if (user.extend !=undefined && user.extend.title != undefined) {
      check(user.extend.title, __("js.ctr.check.user.title.max")).len(0,20);
    }

    if (user.extend !=undefined && user.extend.tel != undefined) {
      check(user.extend.tel, __("js.ctr.check.user.telephone.max")).len(0,30);
    }

    if (user.extend !=undefined && user.extend.description != undefined) {
      check(user.extend.description, __("js.ctr.check.user.description.max")).len(0,100);
    }
  } catch (e) {
    console.log(e);
    return callback_(new error.BadRequest(e.message));
  }
  return callback_();
}