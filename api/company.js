var json = lib.core.json
  , company = require('../controllers/ctrl_company');

//权限check
function commonCheck(req_, res_) {
  var userType = req_.session.user.type;
  //DA系统管理员,开发人员以外的场合,不能访问.
  if (userType !=2 && userType !=3) {
    var err= {
      code : 403,
      message:__("js.common.access.check")
    };
    return res_.send(err.code, json.errorSchema(err.code, err.message));
  }
}

// 获取公司一览
exports.list = function(req_, res_) {
  //权限check
  commonCheck(req_, res_);

  var start = req_.query.start
    , limit = req_.query.count
    , keyword = req_.query.keyword

  company.list(start, limit, keyword , function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

// 获取指定公司
exports.searchOne = function(req_, res_) {
  //权限check
  commonCheck(req_, res_);

  var compid = req_.query.compid;

  company.searchOne(compid, function(err, result) {
      if (err) {
          return res_.send(err.code, json.errorSchema(err.code, err.message));
      } else {
          return res_.send(json.dataSchema(result));
      }
  });
};
// 获取指定公司ID
exports.getByPath = function(req_, res_) {
  //权限check
  commonCheck(req_, res_);

  var getPath = req_.query.getPath;

  company.getByPath(getPath, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};
// 添加公司
exports.add = function(req_, res_) {
  //权限check
  commonCheck(req_, res_);

  var uid = req_.session.user._id;

  company.add(uid, req_.body, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};
// 更新公司
exports.update = function(req_, res_) {
  //权限check
  commonCheck(req_, res_);

  var uid = req_.session.user._id;

  company.update(uid, req_.body, function(err, result) {
      if (err) {
          return res_.send(err.code, json.errorSchema(err.code, err.message));
      } else {
          return res_.send(json.dataSchema(result));
      }
  });
};
// 无效指定公司
exports.active = function(req_, res_) {
  //权限check
  commonCheck(req_, res_);

  var uid = req_.session.user._id;

  company.active(uid, req_.body, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

// 获取公司一览
exports.companyListWithDevice = function(req_, res_) {
  var start = req_.query.start
    , limit = req_.query.count

  company.companyListWithDevice(start, limit, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};
