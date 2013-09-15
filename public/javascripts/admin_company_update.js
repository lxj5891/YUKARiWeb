$(function () {
  'use strict';
  //取得URL参数
  var compid = $('#compId').val();
  //画面表示
  render(compid);
  //事件追加
  $("#addcompany").bind("click", function(event){
    //取得公司信息
    var company = getCompanyData();
    //取得用户信息
    var user = getUserData();
    //更新公司信息
    if (compid && compid.length > 0) {
        //编辑公司
        company.id = compid;
        updateCompany(company,user)
    } else {
        //添加公司
        addCompany(company,user);
    }
    return false;
  });
});

//画面表示
function render(compid) {
  if (compid) {
    smart.doget("/company/findOne.json?compid=" + compid , function(e, result) {
      var inputCompanyType = result.companyType == 1 ? "1" : "0";
      new ButtonGroup("inputCompanyType", inputCompanyType).init();
      $("#inputContract").attr('disabled','disabled');
      $("#inputDemo").attr('disabled','disabled');
      $("#inputAdmin").val(result.mail);
      $("#inputAdmin").attr('disabled','disabled')
      $("#inputPassword").attr('type',"hidden");
      $("#labelInputPass").css("display","none");
      $("#inputNameEn").val(result.name);
      $("#inputNameJp").val(result.kana);
      $("#inputAddress").val(result.address);
      $("#inputTel").val(result.tel);
      $("#inputComPath").val(result.path);
      var inputActive = result.active == 1 ? "1" : "0";
      new ButtonGroup("inputActive", inputActive).init();
      $("#inputActive").attr('disabled','disabled');
    });
  } else {
    new ButtonGroup("inputCompanyType", "1").init();
    new ButtonGroup("inputActive", "1").init();
  }
}

//取得公司信息
function getCompanyData() {
  var company = {
     companyType: $("#inputCompanyType").attr('value')
    , mail: $("#inputAdmin").val()
    , name: $("#inputNameEn").val()
    , kana: $("#inputNameJp").val()
    , address: $("#inputAddress").val()
    , tel: $("#inputTel").val()
    , active: $("#inputActive").attr('value')
    , path: $("#inputComPath").val()
  };
  return company;
}
//取得用户信息
function getUserData() {
  var user = {
      userid: $("#inputAdmin").val()
    , password :$("#inputPassword").val()
    , name : {name_zh : $("#inputNameJp").val()}
    , timezone :$("#timezone").val()
    , lang :"ja"
  }
  return user;
}

//添加公司
function addCompany(company,user) {

  var body = {
     body_company : company,
     body_user    : user
  };
  smart.dopost("/company/add.json", body, function(err, result) {
    if (err) {
      if (result.responseJSON.error.code) {
        Alertify.log.error(result.responseJSON.error.message);
      } else {
        Alertify.log.error(i18n["js.common.add.error"]);
      }
    }else {
      window.location = "/admin/company";
    }

  });
}

//更新公司
function updateCompany(company,user) {
  var body = {
    body_company : company,
    body_user    : user
  };
  smart.doput("/company/update.json", body, function(err, result){
    if (err) {
      if (err.responseJSON.error.code) {
        Alertify.log.error(err.responseJSON.error.message);
      } else {
        Alertify.log.error(i18n["js.common.update.error"]);
      }
    } else {
      window.location = "/admin/company";
    }
  });
}
