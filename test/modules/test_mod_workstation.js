/**
 * @file 单体测试对象：modules/mod_workstation.js
 * @author Sara(fyx1014@hotmail.com)
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var should  = require("should")
  , workstation = require("../../coverage/modules/mod_workstation");

/**
 * 测试代码
 */
describe("Workstation Module", function() {
  var workstationId;
  var userId = "525369803bf4007412000008";
  /**
   * 初始化测试数据
   */
  var data = {
      title       : "test_workstaion"
    , type      : "ise"
    , url       : "http://moe.dreamarts.co.jp"
    , icon      : "15"
    , open      : 0
    , touser    : [ userId ]
    , togroup   : [  ]
    , sortLevel: 1
    , editat    : new Date()
    , editby    : userId
    , createat  : new Date()
    , createby  : userId
    , valid      : 1
    };

  /**
   * 执行测试case
   */
  /*****************************************************************/
  it("add", function(done) {

    workstation.add("", data, function(err, result) {

      should.not.exist(err);
      should.exist(result);

      result.valid.should.equal(1);
      result.icon.should.equal("15");
      workstationId = result._id;

      done();
    });
  });

  /*****************************************************************/
  it("get", function(done) {

    workstation.get("", workstationId, function(err, result) {

      should.not.exist(err);
      should.exist(result);

      result._id.should.eql(workstationId);
      result.valid.should.equal(1);

      done();
    });
  });

  /*****************************************************************/
  it("update", function(done) {
    var now = new Date();

    workstation.update("", workstationId, {editat: now}, function(err, result) {

      should.not.exist(err);
      should.exist(result);

      result._id.should.eql(workstationId);
      result.valid.should.equal(1);
      result.editat.should.eql(now);

      done();
    });
  });

  /*****************************************************************/
  it("getList", function(done) {

    workstation.getList("", {valid: 1}, function(err, result) {

      should.not.exist(err);
      should.exist(result);

      result.length.should.equal(1);
      result[0]._id.should.eql(workstationId);

      done();
    });
  });

  /*****************************************************************/
  it("total", function(done) {

    workstation.total("", {}, function(err, result) {

      should.not.exist(err);
      should.exist(result);

      result.should.greaterThan(0);

      done();
    });
  });

  /*****************************************************************/
  it("remove", function(done) {

    workstation.remove("", userId, workstationId, function(err, result) {

      should.not.exist(err);
      should.exist(result);

      result._id.should.eql(workstationId);
      result.valid.should.equal(0);

      done();
    });
  });

});
