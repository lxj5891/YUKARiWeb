/**
 * @file 单体测试对象：modules/mod_company.js
 * @author r2space@gmail.com
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var should  = require("should")
  , company = require("../../coverage/modules/mod_company");

/**
 * 测试代码
 */
describe("Company Module", function() {

  /**
   * 初始化测试数据
   */
  var data = {
      path        : "1"
    , companyType : "2"
    , mail        : "3"
    , name        : "4"
    , kana        : "5"
    , address     : "6"
    , tel         : "7"
    , active      : 1
    , valid       : 1
    , createat    : new Date()
    , createby    : "8"
    , editat      : new Date()
    , editby      : "9"
    };

  /**
   * 执行测试case
   */
  /*****************************************************************/
  it("add", function(done) {

    company.add(data, function(err, result) {

      should.not.exist(err);
      should.exist(result);
      result.path.should.equal("1");
      result.valid.should.equal(1);

      done();
    });
  });

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
