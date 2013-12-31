$(function () {
  'use strict';
  //取得URL参数
  var compid = $("#compId").val();
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
      updateCompany(company,user);
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
    smart.doget("/company/findOne.json?compid=" + compid , function(err, result) {
      if (err) {
        smart.error(err,i18n["js.common.search.error"],false);
      } else {
        console.log(result);
        var inputCompanyType = result.compInfo.type;// result.companyType
        new ButtonGroup("inputCompanyType", inputCompanyType).init();
        $("#inputContract").attr('disabled','disabled');
        $("#inputDemo").attr('disabled','disabled');
        $("#inputAdmin").val(result.items[0].userName);
        $("#inputAdmin").attr('disabled','disabled')
        $("#inputPassword").attr('type',"hidden");
        $("#labelInputPass").css("display","none");
        $("#inputNameEn").val(result.compInfo.name);
        $("#inputNameJp").val(result.compInfo.extend.kana);
        $("#inputAddress").val(result.compInfo.extend.address);
        $("#inputTel").val(result.compInfo.extend.tel);
        $("#inputComPath").val(result.compInfo.domain);
        $("#inputComPath").attr("oldpath",result.compInfo.domain );
        $("#inputComPath").attr("code",result.compInfo.code);
        var inputActive = result.compInfo.extend.active == 1 ? 1 : 0;
        new ButtonGroup("inputActive", inputActive).init();

        $("#inputActiveGroup").css("display","none");
        $("#inputActive").attr('disabled','disabled');
      }
    });
  } else {
    new ButtonGroup("inputCompanyType", "1").init();
    new ButtonGroup("inputActive", "1").init();
  }
}

//取得公司信息
function getCompanyData() {
  var extend = {
     kana: $("#inputNameJp").val()
    , address: $("#inputAddress").val()
    , tel: $("#inputTel").val()
    , active: $("#inputActive").attr('value')
  }
  var company = {
     type: $("#inputCompanyType").attr('value')
    , mail: $("#inputAdmin").val()
    , name: $("#inputNameEn").val()
  };
  company.extend = extend;
  //编集时,如果会社ID没有变更,不提交.
  if ($("#inputComPath").val() != $("#inputComPath").attr("oldpath")) {
    company.domain = $("#inputComPath").val();
  }else{
    company.domain = $("#inputComPath").attr("oldpath");
  }
  company.code = $("#inputComPath").attr("code");
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
      smart.error(err,i18n["js.common.add.error"],false);
    } else {
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
      smart.error(err,i18n["js.common.update.error"],false);
    } else {
      window.location = "/admin/company";
    }
  });
}
