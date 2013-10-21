var smart     = require("smartcore")
  , json      = smart.core.json
  , errors    = smart.core.errors
  , tag       = require('../controllers/ctrl_tag');

// Tag一览
exports.search = function(req_, res_) {

  var code = req_.session.user.companycode
    , keywords = req_.query.keywords
    , start = req_.query.start
    , limit = req_.query.count;

  tag.search(code, keywords, start, limit, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};