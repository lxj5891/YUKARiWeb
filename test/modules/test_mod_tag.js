/**
 * @file 单体测试对象：modules/mod_tag.js
 * @author r2space@gmail.com
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var should  = require("should")
  , tag = require("../../coverage/modules/mod_tag");

/**
 * 测试代码
 */
describe("Tag Module", function() {

  /**
   * 初始化测试数据
   */
  var data = {
      scope    : "1"
    , name     : "2"
    , counter  : "3"
    , valid    : 1
    , createat : new Date()
    , createby : "4"
    , editat   : new Date()
    , editby   : "5"
    };

  var data1 = {
      scope : "2"
    , name  : "test222" + (new Date()).getTime()
    };


  /**
   * 执行测试case
   */
  /*****************************************************************/
  it("add", function(done) {

    tag.add(null, data, function(err, result) {

      should.not.exist(err);
      should.exist(result);

      done();
    });

  });


  /*****************************************************************/
  it("getList", function(done) {

    tag.getList(null, {valid: 1}, 0, 2, function(err, result) {

      should.not.exist(err);
      should.exist(result);

      result.length.should.equal(2);
      result[0].valid.should.equal(1);
      result[1].valid.should.equal(1);

      done();
    });
  });

  /*****************************************************************/
  it("add", function(done) {

    tag.add(null, data1, function(err, result) {

      should.not.exist(err);
      should.exist(result);

      done();
    });
  });

  /*****************************************************************/
  it("remove", function(done) {

      tag.remove("", data1, function (e, r) {
        should.not.exist(e);
        should.exist(r);

        done();
      });
    });

  /*****************************************************************/
  it("remove", function(done) {

    tag.remove(null, { name: "noData", scope: "noData" }, function (e, r) {
      should.not.exist(e);
      should.exist(!r);

      done();
    });
  });



});
