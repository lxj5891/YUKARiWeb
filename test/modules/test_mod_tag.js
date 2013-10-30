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


  /**
   * 执行测试case
   */
  /*****************************************************************/
  it("add", function(done) {

    tag.add("", data, function(err, result) {

      should.not.exist(err);
      should.exist(result);
//      result.valid.should.equal(1);

      done();
    });

  });

  /*****************************************************************/
  it("add", function(done) {

    tag.add("aNewItem", data, function(err, result) {

      should.not.exist(err);
      should.exist(result);
//      result.valid.should.equal(1);

      done();
    });

  });

  /*****************************************************************/
  it("getList", function(done) {

    tag.getList("", {}, 0, 1, function() {

      done();
    });
  });

  /*****************************************************************/
  it("remove", function(done) {

    tag.remove("", data, function() {

      done();
    });
  });

});
