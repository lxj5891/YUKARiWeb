var json = lib.core.json
  , workstation = require('../controllers/ctrl_workstation');

exports.save = function(req_, res_){
  var uid = req_.session.user._id;
  var code = req_.session.user.companycode;

  var workstation_ = req_.body;

  workstation.save(code, uid, workstation_, function(err, result){
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

exports.get = function(req_, res_){
  var code = req_.session.user.companycode;

  workstation.get(code, function(err, result){
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};