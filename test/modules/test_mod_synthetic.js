"use strict";

var should = require("should")
  , synthetic = require("../../coverage/modules/mod_synthetic");

describe("Synthetic Module", function () {

  var syntheticId = "";
  var data = {
    "comment": "画像セット TEST",
    "cover": [
      {
        "materialId": "526f4e54178baa63d8000017"
      }
    ],
    "covercols": 1,
    "coverrows": 1,
    "createat": new Date(),
    "createby": "526f3fb7af6997efcd000007",
    "editat": new Date(),
    "editby": "526f3fb7af6997efcd000007",
    "metadata": [
      {
        "index": 1,
        "materialId": "526f4e54178baa63d8000018",
        "widget": []
      }
    ],
    "name": "画像セット TEST ",
    "syntheticSign" : '0',
    "page": "1",
    "type": "normal",
    "valid": 1
  }
  var user = {
    _id: "526f3fb7af6997efcd000007"
  }

  it("add", function (done) {

    synthetic.add("74713a40", "normal", user, function (err, result) {
      syntheticId = result._id;
      done();
    });
  });

  it("update", function (done) {
    console.log("update" + syntheticId);
    synthetic.update("74713a40", syntheticId, data, user._id, function (err, result) {
      done();
    });
  });

  it("get", function (done) {

    synthetic.get("74713a40", syntheticId , function (err, result) {
      should.not.exist(err);
      console.log(result);
      done();
    });
  });

  it("total", function (done) {
    synthetic.total("74713a40", {}, function (err, result) {
      should.not.exist(err);
      console.log(result);
      done();
    });
  });

  it("count", function (done) {
    synthetic.count("74713a40", {}, function (err, result) {
      should.not.exist(err);
      console.log(result);
      done();
    });
  });


  it("getList", function (done) {

    synthetic.getList("74713a40", {}, 0, 20, function (err, result) {
      should.not.exist(err);
      console.log(result);
      done();
    });
  });

  it("remove" ,function(done){
    synthetic.remove("74713a40", user._id,syntheticId, function (err, result) {
      should.not.exist(err);
      console.log(result);
      done();
    });
  });

  it("copy" ,function(done){
    synthetic.copy("74713a40", user._id,syntheticId, function (err, result) {
      should.not.exist(err);
      console.log(result);
      done();
    });
  });



});