$(function () {
    'use strict';
    //取得URL参数
    //TODO 暂定取法
    var compid = window.location.href.split("/")[6];
    //画面表示
    render(compid);
    //事件追加
    $("#addcompany").bind("click", function(event){
        //取得公司信息
        var company = getCompanyData();
        //取得用户信息
        var user = getUserData();
        //check公司信息
        var checkResult =  checkCompanyData (company,user,compid);

        //更新公司信息
        if (checkResult)   {
            if (compid) {
                //编辑公司
                company.id = compid;
                updateCompany(company,user)
            } else {
                //添加公司
                addCompany(company,user);
            }
        }
        return false;
    });
});

//画面表示
function render(compid) {
    if (compid) {
        smart.doget("/company/findOne.json?compid=" + compid , function(e, result) {
            if (result.companyType == "1") {
                $("#inputContract").attr("checked","checked");
            } else {
                $("#inputDemo").attr("checked", "checked");
            }
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
            if (result.active == 1) {
                $("#inputActive").attr("checked",true);
            } else {
                $("#inputActive").attr("checked",false);
            }
            $("#inputActive").attr('disabled','disabled');
        });
    }
}

//取得公司信息
function getCompanyData() {
    var active;

    if ($("#inputActive").prop('checked')) {
        active = 1;
    } else {
        active = 0;
    }

    var company = {
         companyType: $('input[type="radio"]:checked').val()
        , mail: $("#inputAdmin").val()
        , name: $("#inputNameEn").val()
        , kana: $("#inputNameJp").val()
        , address: $("#inputAddress").val()
        , tel: $("#inputTel").val()
        , active: active
    };
    return company;
}
//取得用户信息
function getUserData() {
    var user = {
        userid: $("#inputAdmin").val()
      , password :$("#inputPassword").val()
      , name : {
          name_zh : $("#inputNameEn").val()
      }
      , timezone :"GMT+08:00" //TODO 暂定
    }
    return user;
}

//check公司信息
function checkCompanyData(company,user,compid) {
    try {
        if (compid) {
        } else {
          check(company.companyType, i18n["js.public.check.company.type"]).notEmpty();
          check(company.mail, i18n["js.public.check.company.adminid"]).notEmpty().isEmail();
          check(user.password,i18n["js.public.check.company.password"]).notEmpty();
        }
        check(company.name, i18n["js.public.check.company.name"]).notEmpty();

    } catch (e) {
        Alertify.log.error(e.message);
        return false;
    }
    return true;
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
          console.log(err);
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
        Alertify.log.error(i18n["js.common.update.error"]);
        console.log(err);
      } else {
        window.location = "/admin/company";
      }
    });
}
