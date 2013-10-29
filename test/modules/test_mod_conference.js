/**
 * @file 单体测试对象：modules/mod_conference.js
 * @author r2space@gmail.com
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var _ = require("underscore")
  , should = require("should")
  , conference = require("../../coverage/modules/mod_conference");

/**
 * 测试代码
 */
describe("Conference Module", function () {

  /**
   * 初始化测试数据
   */
  var data = {
      picture  : "1"
    , comment  : "2"
    , createat : new Date()
    , createby : "3"
    , editat   : new Date()
    , editby   : "4"
    , valid    : 1
  };

  /**
   * 执行测试case
   */
  /*****************************************************************/
  it("add", function (done) {

    conference.add("", data, function (err, result) {

      should.not.exist(err);
      should.exist(result);
//      result.valid.should.equal(1);

      done();
    });
  });

});