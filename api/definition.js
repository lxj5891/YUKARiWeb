/**
 * 生成iPad用JSON定义
 */

var json = lib.core.json
  , definition = require('../controllers/ctrl_definition')
  , errors  = lib.core.errors;

exports.get = function(req_, res_, isPublish) {
  // Check Params
  if(!req_.query.target) {
    var err = new errors.BadRequest(__("api.param.error","target"));
    res_.send(err.code, json.errorSchema(err.code, err.message));
    return;
  }

  // Get json string for settting
  var uid = req_.session.user._id
    , code = req_.session.user.companycode
    , target = req_.query.target;

  definition.get(code, uid, target, isPublish, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(result);
    }
  });
};


