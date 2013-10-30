/**
 * @file 单体测试对象：modules/mod_material.js
 * @author sl_say@hotmail.com
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var should  = require("should")
  , material = require("../../coverage/modules/mod_material");

/**
 * 测试代码
 */
describe("Material Module", function() {
  /**
   * 初始化测试数据
   */
  var data = {
      fileid         : "525377e8e4c70b694400002c"
    , thumb: {
        big          : "big"
      , middle       : "middle"
      , small        : "small"
      }
    , filename       : "img_filter_select.png"
    , editat         : new Date()
    , editby         : "test"
    , chunkSize      : 262144
    , contentType    : "image/png"
    , length         : 1162
    , tags           : ["test"]
    };

  /**
   * 执行测试case
   */
  /*****************************************************************/
  it("count", function(done) {

    material.count("", {}, function(err, result) {

      should.not.exist(err);
      should.exist(result);

      done();
    });
  });

  /*****************************************************************/
  it("add", function(done) {

    material.add("", data, function(err, result) {

      should.not.exist(err);
      should.exist(result);
      result.length.should.equal(1162);
      result.contentType.should.equal("image/png");

      done();
    });
  });

  /*****************************************************************/
  it("update", function(done) {

    material.update("", "", {}, function() {

      done();
    });
  });

  /*****************************************************************/
  it("replace", function(done) {

    material.replace("", "", {}, function() {

      done();
    });
  });

  /*****************************************************************/
  it("get", function(done) {

    material.get("", "", function() {

      done();
    });
  });

  /*****************************************************************/
  it("remove", function(done) {

    material.remove("", "", function() {

      done();
    });
  });

  /*****************************************************************/
  it("getList", function(done) {

    material.getList("", {}, 0, 1, function() {

      done();
    });
  });

  /*****************************************************************/
  it("total", function(done) {

    material.total("", {}, function(err, result) {

      should.not.exist(err);
      should.exist(result);

      done();
    });
  });

});
