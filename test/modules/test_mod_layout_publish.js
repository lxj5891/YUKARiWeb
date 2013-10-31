"use strict";

var should = require("should")
  , publish = require("../../coverage/modules/mod_layout_publish.js");


describe("layout publish Module", function () {

  var dataId = "";

  var data = {
    layoutId: "526f5cd9806ed6e1dc000005",
    valid: 1,
    active: {
      version: 1
    }
  };

  var data1 = {
    version: 2
  };


  it("add", function (done) {
    publish.add("74713a40", data, function (err, result) {

      should.not.exist(err);
      should.exist(result);
      result.layoutId.should.equal("526f5cd9806ed6e1dc000005");
      result.valid.should.equal(1);
      dataId = result._id;
      done();
    });
  });

  it("update", function (done) {
    publish.update("74713a40", dataId, data1, function (err, result) {
      should.not.exist(err);
      should.exist(result);
      result.layoutId.should.equal("526f5cd9806ed6e1dc000005");
      result.valid.should.equal(1);
      result.active.version.should.equal(2);
      done();
    });
  });


  it("find", function (done) {

    publish.find("74713a40", {layoutId: "526f5cd9806ed6e1dc000005"}, function (err, result) {
      should.not.exist(err);
      should.exist(result);
      result[0].layoutId.should.equal("526f5cd9806ed6e1dc000005");
//      result[0].valid.should.equal(1);
      done();
    });
  });

  it("get", function (done) {

    publish.get("74713a40", {layoutId: "526f5cd9806ed6e1dc000005"}, function (err, result) {
      should.not.exist(err);
      should.exist(result);
      result.layoutId.should.equal("526f5cd9806ed6e1dc000005");

      done();
    });
  });

  it("total", function (done) {
    publish.total("74713a40", {}, function (err, result) {
      should.not.exist(err);
      result.should.greaterThan(0);
      console.log(result);
      done();
    });
  });


  it("getList", function (done) {
    publish.getList("74713a40", {}, 0, 20, function (err, result) {
      should.not.exist(err);
      console.log(result);
      result.length.should.greaterThan(0);
      done();
    });
  });

  it("remove", function (done) {
    publish.remove("74713a40", null, dataId, function (err, result) {
      should.not.exist(err);
      console.log(result);
      done();
    });
  });


});

