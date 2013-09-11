var json = lib.core.json
  , amqp = require('amqp')
  , mq_join = require('config').mq_join
  , layout = require('../controllers/ctrl_layout');

exports.add = function (req_, res_) {

  var uid = req_.session.user._id;
  var company = req_.session.user.companyid;

  layout.add(company, uid, req_.body, function (err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

exports.get = function (req_, res_) {

  var uid = req_.session.user._id;
  var company = req_.session.user.companyid;
  var layoutId = req_.query.id;

  layout.get(company, uid, layoutId, function (err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

exports.update = function (req_, res_) {

  var uid = req_.session.user._id;
  var company = req_.session.user.companyid;
  var layout_ =  req_.body;
  layout_.status = req_.body.status || 1;
  layout_.editat = new Date();
  layout_.editby = uid;

  layout.update(company, uid, layout_, function (err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

exports.apply = function (req_, res_) {

  var uid = req_.session.user._id;
  var company = req_.session.user.companyid;
  var layout_ = {
    _id: req_.body.id,
    status: 2,
    editby: uid,
    editat: new Date(),
    confirmby: req_.body.confirmby || uid
  };

  layout.updateStatus(company, uid, layout_, function (err, result) {
      if (err) {
          return res_.send(err.code, json.errorSchema(err.code, err.message));
      } else {
          return res_.send(json.dataSchema(result));
      }
  });
};

exports.confirm = function (req_, res_) {

  var uid = req_.session.user._id;
  var company = req_.session.user.companyid;
  var layout_ = {
    _id: req_.body.id,
    confirmby : uid,
    confirmat : new Date()
  };

  if (req_.body.confirm == 1) {
    layout_.status = 4;
    layout_.publish = 1;
  } else if (req_.body.confirm == 2) {
    layout_.status = 3;
  }

  // update layout table
  layout.updateStatus(company, uid, layout_, function (err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });

};

exports.remove = function(req_, res_) {
  var company = req_.session.user.companyid;
  var uid = req_.session.user._id
    , id = req_.body.id
    , layoutId = req_.body.layoutId;      // remove publishLayout

  layout.remove(company, uid, id, layoutId, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};

//////////////////////////////////////////////////
// layput list

exports.list = function(req_, res_) {

  var company = req_.session.user.companyid
    , start = req_.query.start
    , limit = req_.query.count
    , publish = req_.query.publish
    , keyword = req_.query.keyword
    , status = req_.query.status;

    if (publish == 1) {
        layout.publishList(keyword,company, start, limit, function(err, result) {
            if (err) {
                return res_.send(err.code, json.errorSchema(err.code, err.message));
            } else {
                return res_.send(json.dataSchema(result));
            }
        });
    } else {
        var uid = req_.session.user._id;
        layout.list(keyword,company, start, limit, uid, status, function(err, result) {
            if (err) {
                return res_.send(err.code, json.errorSchema(err.code, err.message));
            } else {
                return res_.send(json.dataSchema(result));
            }
        });
    }
};

exports.history = function(req_, res_) {

  var company = req_.session.user.companyid
    , start = req_.query.start
    , limit = req_.query.count
    , publish = req_.query.publish;

  layout.history(company, start, limit, publish, function(err, result) {
    if (err) {
      return res_.send(err.code, json.errorSchema(err.code, err.message));
    } else {
      return res_.send(json.dataSchema(result));
    }
  });
};
