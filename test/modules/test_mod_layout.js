/**
 * Created by kita on 13-10-30.
 */

"use strict";

var should  = require("should")
  , i18n      = require("i18n")
  , layout = require("../../coverage/modules/mod_layout");

/**
 * 测试代码
 */
describe("Layout Module", function() {
  var layoutId;
  /**
   * 初始化测试数据
   */
  var data = {
    layout: {
      name: "__test__case"
    , comment: "2"
    , image: {
        imageH: "3"
      , imageV: "4"
      }
    , page: [{
        image: "5"
      , type: 1
      , tile: [{
          num: 1
        , rowspan: 1
        , colspan: 1
        , syntheticId: "6"
        }]
      }]
    }
  , status: 1
  , publish: 0
  , confirmby: "7"
  , confirmat: new Date()
  , applyat: new Date()
  , viewerUsers: ["8"]
  , viewerGroups: ["9"]
  , openStart: new Date()
  , openEnd: new Date()
  , editat: new Date()
  , editby: "10"
  , createat: new Date()
  , createby: "11"
  , valid: 1
  };

  it("add", function (done) {
    layout.add(null, data, function (err, result) {
      should.not.exist(err);
      should.exist(result);
      result.valid.should.equal(1);
      result.layout.name.should.equal(data.layout.name);
      layoutId = result._id;

      done();
    });
  });

  it("find", function (done) {
    layout.find(null, {valid: 1, "layout.name": data.layout.name}, function (err, result) {
      should.not.exist(err);
      should.exist(result);
      result.length.should.greaterThan(0);

      var l = result[0];
      l.valid.should.equal(1);
      l.layout.name.should.equal(data.layout.name);

      done();
    });
  });

  it("get", function (done) {
    layout.get(null, {_id: layoutId, valid: 1}, function (err, result) {
      should.not.exist(err);
      should.exist(result);

      result._id.should.eql(layoutId);
      result.valid.should.equal(1);
      result.status.should.equal(data.status);
      result.layout.name.should.equal(data.layout.name);

      done();
    });
  });

  it("update", function (done) {
    layout.find(null, {valid: 1, "layout.name": data.layout.name}, function (err, result) {
      should.not.exist(err);
      should.exist(result);

      var oldData = result[0];
      var newData = {};
      newData.status = 2;
      newData.editby = "99";

      layout.update(null, oldData._id, newData, function (e, r) {
        should.not.exist(e);
        should.exist(r);
        r._id.should.eql(oldData._id);
        r.status.should.equal(2);
        r.editby.should.equal("99");

        done();
      });
    });
  });

  it("copy", function (done) {
    layout.find(null, {valid: 1, "layout.name": data.layout.name}, function (err, result) {
      should.not.exist(err);
      should.exist(result);

      var oldData = result[0];

      layout.copy(null, "copy", oldData._id, function (e, newData) {
        should.not.exist(e);
        should.exist(newData);

        newData.status.should.equal(oldData.status);
        newData.createby.should.equal("copy");
        newData.layout.name.should.equal(oldData.layout.name + i18n.__("js.mod.copy.title"));
        newData._id.toString().should.not.equal(oldData._id.toString());

        done();
      });
    });
  });

  it("total", function (done) {
    layout.total(null, {valid: 1}, function (err, result) {
      should.not.exist(err);
      should.exist(result);
      result.should.greaterThan(0);

      done();
    });
  });

  it("count", function (done) {
    layout.count(null, {valid: 1}, function (err, result) {
      should.not.exist(err);
      should.exist(result);
      result.should.greaterThan(0);

      done();
    });
  });

  it("getList", function (done) {
    layout.getList(null, {valid: 1}, 0, 2, function (err, result) {
      should.not.exist(err);
      should.exist(result);

      result.length.should.equal(2);
      result[0].valid.should.equal(1);
      result[1].valid.should.equal(1);

      done();
    });
  });

  it("remove", function (done) {
    layout.find(null, {valid: 1, "layout.name": data.layout.name}, function (err, result) {
      should.not.exist(err);
      should.exist(result);

      var oldData = result[0];

      layout.remove(null, "remove", oldData._id, function (e, r) {
        should.not.exist(e);
        should.exist(r);

        r.editby.should.equal("remove");
        r.valid.should.equal(0);

        done();
      });
    });
  });
});