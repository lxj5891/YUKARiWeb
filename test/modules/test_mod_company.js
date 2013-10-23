/**
 * @file 单体测试对象：modules/mod_company.js
 * @author r2space@gmail.com
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

var assert  = require("assert")
  , _       = require("underscore")
  , company = require("../../coverage/modules/mod_company");

/**
 * 测试代码
 */
describe("Company Module", function() {

  /**
   * 初始化测试数据
   */

  /**
   * 执行测试case
   */
  /*****************************************************************/
  it("getList", function(done) {

    company.getList({}, 0, 1, function() {

      done();
    });
  });

  /*****************************************************************/
  it("getByPath", function(done) {

    company.getByPath("", function() {

      done();
    });
  });

  /*****************************************************************/
  it("getByCode", function(done) {

    company.getByCode("", function() {

      done();
    });
  });

  /*****************************************************************/
  it("get", function(done) {

    company.get("", function() {

      done();
    });
  });

  /*****************************************************************/
  it("add", function(done) {

    company.add("", function() {

      done();
    });
  });

  /*****************************************************************/
  it("update", function(done) {

    company.update("", {}, function() {

      done();
    });
  });

  /*****************************************************************/
  it("total", function(done) {

    company.total({}, function() {

      done();
    });
  });

});
