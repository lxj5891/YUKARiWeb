/**
 * @file 单体测试对象：modules/mod_setting.js
 * @author r2space@gmail.com
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var should  = require("should")
  , setting = require("../../coverage/modules/mod_setting.js");

/**
 * 测试代码
 */
describe("Setting Module", function() {

  /**
   * 初始化测试数据
   */
  var data = {
      key         : "" + new Date().getTime()
    , val         : "testval"
    , valid       : 1
    , createat    : new Date()
    , createby    : "test"
    , editat      : new Date()
    , editby      : "test"
    };

  /**
   * 执行测试case
   */
  /*****************************************************************/
  it("add_add", function(done) {
    
    setting.add(null, data, function(err, result) {
      
      result.key.should.equal(data.key);
      result.val.should.equal("testval");
      result.valid.should.equal(1);

      done();
    });
    
  });

  /*****************************************************************/
  it("add_update", function(done) {

    data.val = "testval2";
    
    setting.add(null, data, function(err, result) {
      
      result.val.should.equal("testval2");
      
      done();
    });
    
  });
  
  /*****************************************************************/
  it("getListByKeys", function(done) {

    setting.getListByKeys(null, [data.key], function(err, result) {
      
      result.length.should.equal(1);
      result[0].val.should.equal("testval2");

      done();
      
    });

  });

});


