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
  return exports.isSuperAdmin(user_) || (exports.isCommonUser(user_) && user_.authority.contents === 1);
}

exports.hasNoticePermit = function(user_){
  return exports.isSuperAdmin(user_) || (exports.isCommonUser(user_) && user_.authority.notice === 1);
}

exports.hasApprovePermit = function(user_){
  return exports.isSuperAdmin(user_) || (exports.isCommonUser(user_) && user_.authority.approve === 1);
}