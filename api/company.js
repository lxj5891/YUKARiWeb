var json = lib.core.json
  , company = require('../controllers/ctrl_company');

// 获取公司一览
exports.list = function(req_, res_) {

  var start = req_.query.start
    , limit = req_.query.count

  company.list(start, limit, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

// 获取指定公司
exports.searchOne = function(req_, res_) {

    var compid = req_.query.compid;

    company.searchOne(compid, function(err, result) {
        if (err) {
            return res_.send(err.code, json.errorSchema(err.code, err.message));
        } else {
            return res_.send(json.dataSchema(result));
        }
    });
};
// 添加公司
exports.add = function(req_, res_) {

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

    var uid = req_.session.user._id;

    company.update(uid, req_.body, function(err, result) {
        if (err) {
            return res_.send(err.code, json.errorSchema(err.code, err.message));
        } else {
            return res_.send(json.dataSchema(result));
        }
    });
};
// 删除指定公司(逻辑删除)
exports.remove = function(req_, res_) {

  var uid = req_.session.user._id;

  company.remove(uid, req_.body, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};
// 无效指定公司
exports.active = function(req_, res_) {

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
