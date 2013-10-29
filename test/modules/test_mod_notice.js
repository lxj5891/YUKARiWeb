/**
 * @file 单体测试对象：modules/mod_notice.js
 * @author r2space@gmail.com
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var should  = require("should")
  , notice = require("../../coverage/modules/mod_notice");

/**
 * 测试代码
 */
describe("Notice Module", function() {

  /**
   * 初始化测试数据
   */
  var data = {
      title    : "1"
    , touser   : "2"
    , togroup  : "3"
    , notice   : "4"
    , valid    : 1
    , createat : new Date()
    , createby : "5"
    , editat   : new Date()
    , editby   : "6"
  };

  /**
   * 执行测试case
   */
  /*****************************************************************/
  it("add", function(done) {

    notice.add("", data, function(err, result) {

      should.not.exist(err);
      should.exist(result);
//      result.valid.should.equal(1);

      done();
    });
  });

  /*****************************************************************/
  it("findOne", function(done) {

    notice.findOne("", {}, function() {

      done();
    });
  });

  /*****************************************************************/
  it("getList", function(done) {

    notice.getList("", {}, 0, 1, function() {

      done();
    });
  });

  /*****************************************************************/
  it("total", function(done) {

    notice.total("", {}, function() {

      done();
    });
  });

  /*****************************************************************/
  it("findOne", function(done) {

    notice.findOne("", {}, function() {

      done();
    });
  });

});
