/**
 * @file 工具类，权限判断用等共同方法
 * @author r2space@gmail.com
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var _ = smart.util.underscore;

/**
 * 确认是否可以发送通知
 * @param user 用户对象
 * @returns {boolean} 可以：true
 */
exports.hasNoticePermit = function(user) {
  return exports.isSuperAdmin(user)
    || exports.isAdmin(user)
    || (exports.isCommonUser(user) && user.authority && user.authority.notice === 1);
}

/**
 * 是否是超级用户（DEV）
 * @param {Object} user 用户对象
 * @returns {boolean} 判断结果
 */
exports.isSuperAdmin = function(user) {
  return user.extend.type === 3;
}


/**
 * 是否是普通用户
 * @param {Object} user 用户对象
 * @returns {boolean} 判断结果
 */
exports.isCommonUser = function(user){
  return user.extend.type === 0;
}

/**
 * 是否是顾客管理员
 * @param {Object} user 用户对象
 * @returns {boolean} 判断结果
 */
exports.isAdmin = function(user) {
  return user.extend.type === 1;
}

/**
 * 是否是DA管理员
 * @param {Object} user 用户对象
 * @returns {boolean} 判断结果
 */
exports.isSystemAdmin = function(user) {
  return user.extend.type === 2;
}

// -------------- 以下未整理



exports.hasContentPermit = function(user_){
  return exports.isSuperAdmin(user_) || (exports.isCommonUser(user_) && user_.authority && user_.authority.contents === 1);
}

exports.hasApprovePermit = function(user_){
  return exports.isSuperAdmin(user_) || (exports.isCommonUser(user_) && user_.authority &&  user_.authority.approve === 1);
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