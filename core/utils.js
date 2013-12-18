var _ = smart.util.underscore;

exports.isCommonUser = function(user_){//普通用户
  return user_.type === 0;
}

exports.isAdmin = function(user_){//顾客管理员
  return user_.type === 1;
}

exports.isSystemAdmin = function(user_){//DA 管理员
  return user_.type === 2;
}

exports.isSuperAdmin = function(user_){// dev
  return user_.type === 3;
}

exports.hasContentPermit = function(user_){
  return exports.isSuperAdmin(user_) || (exports.isCommonUser(user_) && user_.authority && user_.authority.contents === 1);
}

exports.hasNoticePermit = function(user_){
  return exports.isSuperAdmin(user_) || exports.isAdmin(user_) || (exports.isCommonUser(user_) && user_.authority && user_.authority.notice === 1);
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