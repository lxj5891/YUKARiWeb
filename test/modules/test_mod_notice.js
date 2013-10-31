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

  var noticeId;

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
      result.valid.should.equal(1);
      result.title.should.equal("1");
      result.notice.should.equal("4");
      noticeId = result._id;

      done();
    });
  });

  /*****************************************************************/
  it("findOne", function(done) {

    notice.findOne(null, noticeId, function(err, result) {

      should.not.exist(err);
      should.exist(result);

      done();
    });
  });

  /*****************************************************************/
  it("getList", function(done) {

    notice.getList(null, {valid: 1}, 0, 2, function(err, result) {

      should.not.exist(err);
      should.exist(result);

      result.length.should.equal(2);
      result[0].valid.should.equal(1);
      result[1].valid.should.equal(1);

      done();
    });
  });

  /*****************************************************************/
  it("total", function(done) {

    notice.total(null, {valid: 1}, function(err, result) {

      should.not.exist(err);
      should.exist(result);
      result.should.greaterThan(0);

      done();
    });
  });



});
