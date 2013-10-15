var conference = require('../modules/mod_conference');

exports.add = function(code_, uid_, conference_, callback_){
  conference_.createat = new Date();
  conference_.createby = uid_;

  conference.add(code_, conference_, function(err, result){
    if (err) {
      return callback_(new error.InternalServer(err));
    }

    return callback_(err, result);
  });
};