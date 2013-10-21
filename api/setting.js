var smart     = require("smartcore")
  , setting   = require('../controllers/ctrl_setting')
  , errors    = smart.core.errors
  , json      = smart.core.json
  , utils     = require('../core/utils');


exports.updateAppimage = function (req_, res_) {
  if(!canUpdate(req_.session.user)){
    return noUpdateResponse(res_);
  }
  var image1 = req_.body.image1
    , image2 = req_.body.image2
    , logo = req_.body.logo
    , code = req_.session.user.companycode
    , user = req_.session.user;

  setting.updateAppimage(code, user, image1, image2, logo, function (err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });


};

exports.getAppimage = function (req_, res_) {
//  if(!canUpdate(req_.session.user)){
//    return noUpdateResponse(res_);
//  }
  var code = req_.session.user.companycode;
  setting.getAppimage(code,function(err,result){
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema({items:result}));
    }
  });
};

function canUpdate(user_){
  return utils.hasContentPermit(user_) || utils.isAdmin(user_);
}

function noUpdateResponse(res_){
  var err= new errors.Forbidden(__("js.common.update.check"));
  return res_.send(err.code, json.errorSchema(err.code, err.message));
}