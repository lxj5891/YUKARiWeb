var sync     = require('async')
  , _         = require('underscore')
  , check     = require('validator').check
  , company   = require('../modules/mod_company.js')
  , device    = require('../controllers/ctrl_device')
  , error     = lib.core.errors
  , user      = lib.ctrl.user
  , auth      = lib.core.auth ;

/**
 * 获取公司一览
 * @param start_
 * @param limit_
 * @param callback_
 */
exports.list = function(start_, limit_, callback_) {

  var start = start_ || 0
    , limit = limit_ || 20
    , condition = {
          valid:1
      };
    company.total(function(err, count){
        if (err) {
            return callback_(new error.InternalServer(err));
        }
        company.list(condition, start, limit, function(err, result){
            console.log(err);
            if (err) {
                return callback_(new error.InternalServer(err));
            }
            return callback_(err,  {totalItems: count, items:result});
        });
    });
};

exports.companyListWithDevice = function(start_, limit_, callback){
  exports.list(start_, limit_, function(err, comps){
    var task_getDeviceCount = function(comp_,subCB){
      device.deviceTotalByComId(comp_._id.toString(),function(err,count){
        comp_._doc.deviceCount = count;
        user.userTotalByComId(comp_._id.toString(),function(err,ucount){
          comp_._doc.userCount = ucount;
          subCB(err);
        });

      });
    };
    sync.forEach(comps.items, task_getDeviceCount, function(err){
      callback(err, comps);
    });


  });
}

/**
 * 获取指定公司
 * @param compid
 * @param callback_
 * @returns {*}
 */
exports.searchOne = function( compid, callback_) {
    company.searchOne(compid, function(err, result){
        if (err) {
            return callback_(new error.InternalServer(err));
        }
        return callback_(err, result);
    });

};

/**
 * 添加公司
 * @param uid_
 * @param data_
 * @param callback_
 * @returns {*}
 */
exports.add = function(uid_, data_, callback_) {
  var comp_ = data_.body_company;
      comp_.createat = new Date();
      comp_.createby = uid_;
      comp_.editat = new Date();
      comp_.editby = uid_;

  var user_ = data_.body_user;
      user_.createat = new Date();
      user_.createby = uid_;
      user_.editat = new Date();
      user_.editby = uid_;
      user_.password = auth.sha256(user_.password);

  sync.waterfall([

       function(callback) {
         // 确认用户id重复
         user.findUserList({"uid": uid_}, function(err, result) {
           if (err) {
             callback(new error.InternalServer("システムエラーが発生しました。"));
           }

           if (result) {
             callback(new error.BadRequest("ユーザが存在しました。"));
           }

         });
       },
        // 添加公司
        function(rtncheck,callback) {
            company.add(comp_, function(err, result) {
                callback(err, result);

            });
        },

        // 添加用户
        function(result,callback) {
            user_.type = 1;
            user_.active = 1;
            user_.companyid = result.id;
            user.add(uid_, user_, function(err,resultuser){
                if (err) {
               //TODO  rollback未对应
                }
                callback(err, result);
            });
        }

    ], function(err, result) {
        callback_(err, result);
    });
};

/**
 * 更新指定公司
 * @param uid_
 * @param comp_
 * @param callback_
 * @returns {*}
 */
exports.update = function(uid_, data_, callback_) {
     var comp_ = data_.body_company;
    comp_.editat = new Date();
    comp_.editby = uid_;

    company.update(comp_.id, comp_, function(err, result){
        if (err) {
            return callback_(new error.InternalServer(err));
        }
        return callback_(err, result);
    });

};
exports.remove= function(uid_, comp_, callback_) {
  comp_.editat = new Date();
  comp_.editby = uid_;
  comp_.valid = 0;

  sync.waterfall([
    // 更新公司
    function(callback) {
      company.update(comp_.id,comp_, function(err, result) {
        callback(err, result);
      });
    },

    // 更新用户
    function(result,callback) {
      user.remove(uid_, result._id, function(err,rtn){
        callback(err, rtn);
      });
    }

  ], function(err, result) {
    callback_(err, result);
  });

};

exports.active= function(uid_, comp_, callback_) {
  comp_.editat = new Date();
  comp_.editby = uid_;

  sync.waterfall([
    // 更新公司
    function(callback) {
      company.update(comp_.id,comp_, function(err, result) {
        callback(err, result);
      });
    },

    // 更新用户
    function(result,callback) {
      user.active(uid_, result._id, comp_.active, function(err,rtn){
        callback(err, rtn);
      });
    }

  ], function(err, result) {
    callback_(err, result);
  });

};

