/**
 * 生成iPad用JSON定义
 */


var json      = smart.framework.response
  , errors    = smart.framework.errors
  , definition = require('../controllers/ctrl_definition');

exports.get = function(req_, res_, isPublish) {
  // Check Params
  if(!req_.query.target) {
    var err = new errors.BadRequest(__("api.param.error","target"));
    res_.send(err.code, json.errorSchema(err.code, err.message));
    return;
  }

  // Get json string for settting
  var user = req_.session.user
    , code = req_.session.user.companycode
    , target = req_.query.target;

  definition.get(code, user, target, isPublish, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(result);
    }
  });
};


