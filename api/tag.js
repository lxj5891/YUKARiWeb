var json      = smart.framework.response
  , errors    = smart.framework.errors
  , context = smart.framework.context
  , response = smart.framework.response
  , log = smart.framework.log
  , tag       = require('../controllers/ctrl_tag');



// Tag一览
exports.search = function(req_, res_) {
  var handler = new context().bind(req_,res_);
//  var code = req_.session.user.companycode
//    , keywords = req_.query.keywords
//    , start = req_.query.start
//    , limit = req_.query.count;

  tag.search(handler, function(err, result) {
    log.operation("finish : search tags list",handler.uid);
    response.send(res_,err,result);
//    if (err) {
//      return res_.send(err.code, json.errorSchema(err.code, err.message));
//    } else {
//      return res_.send(json.dataSchema(result));
//    }
  });
};