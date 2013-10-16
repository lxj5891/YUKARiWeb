var json = lib.core.json,
    conference = require('../controllers/ctrl_conference');

exports.add = function (req_, res_) {
  var uid = req_.session.user._id;
  var code = req_.session.user.companycode;

  conference.add(code, uid, req_.body, function(err, result){
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};