var apis    = require('./apis')
  , synthetic = require('./synthetic')
  , website = require('./website');

/*
 * GET home page.
 */

exports.guiding = function (app) {
  apis.guiding(app);
  synthetic.guiding(app);

  website.guiding(app);


};

