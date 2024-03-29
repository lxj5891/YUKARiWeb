var response      = smart.framework.response
  , errors        = smart.framework.errors
  , log           = smart.framework.log
  , context       = smart.framework.context
  , company       = require('../controllers/ctrl_company')
  , util          = require('../core/utils');
//权限check
function commonCheck(req_, res_) {
  var user =  req_.session.user;
  //DA系统管理员,开发人员以外的场合,不能访问.
  if (!util.isSystemAdmin(user)  && !util.isSuperAdmin(user)) {
    var err= new errors.Forbidden(__("js.common.access.check"));
    res_.send(err.code, response.errorSchema(err.code, err.message));
    return false;
  }
  return true;
}

// 获取公司一览
exports.list = function(req_, res_) {
  var handler=new context().bind(req_, res_);
  //权限check
  if (!commonCheck(req_, res_)) {
    return;
  };
    company.list(handler , function(err, result) {
    log.operation("finish: find list: ",handler.uid);
    response.send(res_,err,result);
  });
};


// 获取指定公司
exports.searchOne = function(req_, res_) {
  var handler =new context().bind(req_, res_);
  //权限check
  if (!commonCheck(req_, res_)) {
    return;
  };
  company.searchOne(handler, function(err, result) {
    log.operation("finish: find list: ",handler.uid);
    response.send(res_,err,result);
  });
};
// 获取指定公司ID
exports.getByPath = function(req_, res_) {

  var getPath = req_.query.getPath;

  company.getByPath(getPath, function(err, result) {
    if (err) {
      return res_.send(err.code, response.errorSchema(err.code, err.message));
    } else {
      return res_.send(response.dataSchema(result));
    }
  });
};
// 添加公司
exports.add = function(req_, res_) {
  var handler = new context().bind(req_, res_);
  //权限check
  if (!commonCheck(req_, res_)) {
    return;
  };
  company.add(handler, function(err, result) {
    log.operation("finish: add an company: ",handler.uid);
    response.send(res_,err,result);
  });
};
// 更新公司
exports.update = function(req_, res_) {
  var handler=new context().bind(req_, res_);
  //权限check
  if (!commonCheck(req_, res_)) {
    return;
  };

  company.update(handler, function(err, result) {

     response.send(res_,err,result);

  });
};
// 无效指定公司
exports.active = function(req_, res_) {
  var handler=new context().bind(req_, res_);
  //权限check
  if (!commonCheck(req_, res_)) {
    return;
  };

  company.active(handler, function(err, result) {

      response.send(res_,err,result)

  });
};

// 获取公司一览
exports.companyListWithDevice = function(req_, res_) {
  var start = req_.query.start
    , limit = req_.query.count

  company.companyListWithDevice(start, limit, function(err, result) {
    if (err) {
      return res_.send(err.code, response.errorSchema(err.code, err.message));
    } else {
      return res_.send(response.dataSchema(result));
    }
  });
};
