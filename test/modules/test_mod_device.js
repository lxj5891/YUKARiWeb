/**
 * @file 单体测试对象：modules/mod_device.js
 * @author lizheng
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var should  = require("should")
  , dev = require("../../coverage/modules/mod_device.js");

/**
 * 测试代码
 */
describe("Device Module", function() {

  /**
   * 初始化测试数据
   */
  var data = {
      companyid         : "" + new Date().getTime()
    , companycode       : "2"
    , devicetoken       : "3"
    , deviceuid         : "4"
    , deviceid          : "" + new Date().getTime()
    , deviceType        : "6"
    , devstatus         : "7"
    , userinfo: [{
        userid          : "8"
      , username        : "9"
      , status          : "3"
      }]
    , description       : "11"
    , valid             : 1
    , createat          : new Date()
    , createby          : "test"
    , editat            : new Date()
    , editby            : "test"
    };
  
  /** 
   * 执行测试case
   */
  /*****************************************************************/
  it("add", function(done) {
    
    dev.add(null, data, function(err, result) {
      
      result.companyid.should.equal(data.companyid);
      result.companycode.should.equal("2");
      result.userinfo[0].userid.should.equal("8");
      
      done();
    });
    
  });
  
  /*****************************************************************/
  it("allow", function(done) {
    
    dev.allow(null, "222", data.deviceid, "8", true, function(err, result) {
      
      done();
    });
    
  });
  
  /*****************************************************************/
  it("getList", function(done) {
    
    dev.getList(null, {"deviceid" : data.deviceid, "userinfo.status" : "1"}, function(err, result) {
      
      result.length.should.equal(1);
      
      done();
    });
    
  });
  

  /*****************************************************************/
  it("totalByComId", function(done) {
    
    dev.totalByComId(null, data.companyid, function(err, count) {

      (count).should.equal(1);
      
      done();
    });
    
  });
  
  /*****************************************************************/
  it("getAndUpdate", function(done) {
    
    data.devstatus = "111";
    
    dev.getAndUpdate(null, {"deviceid" : data.deviceid, "userinfo.status" : "1"}, data, function(err, result) {

      result.devstatus.should.equal("111");
      
      done();
    });
    
  });

  /*****************************************************************/
  it("total", function(done) {
    
    dev.total(null, function() {

      done();
    });
    
  });
  
  /*****************************************************************/
  it("getListByPage", function(done) {
    
    dev.getListByPage(null, {"userinfo.status" : "1"}, 0, 15, function() {

      done();
    });
    
  });
  
  /*****************************************************************/
  it("update", function(done) {
    
    dev.getList(null, {"deviceid" : data.deviceid}, function(err1, result1) {
      
      var device = {
          "devstatus": "222"
        };
      
      dev.update(null, result1[0]._id, device, function(err2, result2) {

        result2.devstatus.should.equal("222");
        
        done();
      });
    });
    
  });

});


