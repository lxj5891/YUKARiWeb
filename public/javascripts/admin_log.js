$(function () {
  "use strict";
  init();
});

var clientTime = new Date().getTime();
var format = "YYYY/MM/DD HH:mm";
var bufSize = 200;
var clearBy = 20;
var realTimeStarted = false;
var recentResultTime = 0;
var timeout = 700;

function init() {
  new ButtonGroup("timeDiv", "range").init();

  var dateTimeOpts = {
    format: format,
    separator: " ~ ",
    minDate: "2013-10-30",
    showDropdowns: true,
    timePicker: true,
    timePickerIncrement: 5,
    timePicker12Hour: false
  };
  var locale = getLocale();
  if(locale) {
    dateTimeOpts.locale = locale;
  }
  $("#timeRange").daterangepicker(dateTimeOpts);

  $("#timeDiv button").click(function() {
    if($(this).val() === "range") { // 範囲
      $("#timeRangeDiv").show();
      $("#searchBtn").show();
      $("#startBtn").hide();
      $("#optBox").hide();
    } else { // リアルタイム
      $("#timeRangeDiv").hide();
      $("#searchBtn").hide();
      $("#startBtn").show();
      $("#optBox").show();
    }
    $("#stopBtn").hide();
    $("#stopBtn2").hide();

    $("#pagination_area").html("");
    smart.paginationInitalized = false;
    realTimeStarted = false;
    $("#log_list").html("");
  });

  $("#sourceDiv button").click(function() {
    if($(this).hasClass("btn-info")) {
      $(this).removeClass("btn-info").addClass("btn-white");
    } else {
      $(this).removeClass("btn-white").addClass("btn-info");
    }
  });

  $("#typeDiv button").click(function() {
    if($(this).hasClass("btn-info")) {
      $(this).removeClass("btn-info").addClass("btn-white");
    } else {
      $(this).removeClass("btn-white").addClass("btn-info");
    }
  });

  $("#levelDiv button").click(function() {
    if($(this).hasClass("btn-info")) {
      var prev = $(this).prev();
      if(prev.length > 0 && prev.hasClass("btn-info")) {
        $(this).prevAll().removeClass("btn-info").addClass("btn-white");
      } else {
        $(this).removeClass("btn-info").addClass("btn-white");
      }
    } else {
      $(this).prevAll().removeClass("btn-info").addClass("btn-white");
      $(this).nextAll().add($(this)).removeClass("btn-white").addClass("btn-info");
    }
  });

  $("#searchBtn").click(function() {
    smart.paginationInitalized = false;
    doSearch(0, 20, callback4RangeSearch);
  });

  $("#startBtn").click(function() {
    $(this).hide();
    $("#stopBtn").show();
    $("#stopBtn2").show();

    $("#log_list").html("");
    smart.paginationInitalized = false;
    realTimeStarted = true;
    recentResultTime = (new Date().getTime()) - clientTime + Number($("#serverTime").val());
    doSearch(0, bufSize, callback4RealTimeSearch);
  });

  $("#stopBtn").click(function() {
    $(this).hide();
    $("#stopBtn2").hide();
    $("#startBtn").show();
    realTimeStarted = false;
  });

  $("#cleanBtn").click(function() {
    $("#statusBox").html("0");
    $("#statusBox").removeClass("ngStatus").addClass("okStatus");
    $("#log_list").html("");
  });

  $("#stopBtn2").click(function() {
    $(this).hide();
    $("#stopBtn").hide();
    $("#startBtn").show();
    realTimeStarted = false;
  });

  $("#foldBtn").click(function() {
    if($(this).hasClass("icon-circle-arrow-up")) {
      $(this).removeClass("icon-circle-arrow-up").addClass("icon-circle-arrow-down");
      $(this).attr("title", $(this).attr("titleOpen"));
    } else {
      $(this).removeClass("icon-circle-arrow-down").addClass("icon-circle-arrow-up");
      $(this).attr("title", $(this).attr("titleClose"));
    }

    $("#conditionForm").toggle();
  });
}

function getLocale() {
  var lang = $("#lang").val();
  if(lang === "ja") {
    return {
      applyLabel: "適用",
      cancelLabel: "キャンセル",
      fromLabel: "<b>から</b>",
      toLabel: "<b>まで</b>",
      weekLabel: "曜日",
      customRangeLabel: "カスタムレンジ",
      daysOfWeek: ["日","月","火","水","木","金","土"],
      monthNames: ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],
      firstDay: 0
    };
  } else if(lang === "zh") {
    return {
      applyLabel: "确定",
      cancelLabel: "取消",
      fromLabel: "<b>从</b>",
      toLabel: "<b>到</b>",
      weekLabel: "周",
      customRangeLabel: "自定义区间",
      daysOfWeek: ["日","一","二","三","四","五","六"],
      monthNames: ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],
      firstDay: 0
    };
  }

  return null;
}

function doSearch(start, limit, callback) {
  var condition = resolveCondition();
  condition.start = start;
  condition.limit = limit;
  smart.doget("/admin/log/list.json?" + serialize(condition), callback);
}

function resolveCondition() {
  var condition = {};

  // 時間
  var timeType = $("#timeDiv").attr("value");
  if(timeType == "range") { // 範囲
    var range = $("#timeRange").val();
    if(range.length > 0) {
      var startTime = sanitize(range.split("~")[0]).trim();
      var endTime = sanitize(range.split("~")[1]).trim();

      if(startTime.length > 0) {
        condition.startTime = moment(startTime, format).valueOf();
      }
      if(endTime.length > 0) {
        condition.endTime = moment(endTime, format).valueOf();
      }
    }
  } else { // リアルタイム
    condition.startTime = recentResultTime;
  }

  // ユーザ
  var user = $("#user").val();
  if(user.length > 0) {
    condition.user = [];
    _.each(user.split(","), function(element) {
      var tmp = sanitize(element).trim();
      if(tmp.length > 0) {
        condition.user.push(tmp);
      }
    });
  }

  // IP
  var host = $("#host").val();
  if(host.length > 0) {
    condition.host = [];
    _.each(host.split(","), function(element) {
      var tmp = sanitize(element).trim();
      if(tmp.length > 0) {
        condition.host.push(tmp);
      }
    });
  }

  // ソース
  condition.source = [];
  $("#sourceDiv button.btn-info").each(function() {
    condition.source.push($(this).val());
  });

  // タイプ
  condition.type = [];
  $("#typeDiv button.btn-info").each(function() {
    condition.type.push($(this).val());
  });

  // レベル
  condition.level = [];
  $("#levelDiv button.btn-info").each(function() {
    condition.level.push($(this).val());
  });

  // レベル
  condition.message = sanitize($("#message").val()).trim();

  return condition;
}

function serialize(condition) {
  var str = "";

  if(condition.startTime) {
    str += "startTime=" + condition.startTime + "&";
  }
  if(condition.endTime) {
    str += "endTime=" + condition.endTime + "&";
  }

  _.each(["user", "host", "source", "type", "level"], function(pname) {
    if(condition[pname] && condition[pname].length > 0) {
      _.each(condition[pname], function(pval) {
        str += pname + "=" + pval + "&";
      });
    }
  });

  if(condition.message.length > 0) {
    str += "message=" + condition.message + "&";
  }

  str += "start=" + condition.start + "&";
  str += "limit=" + condition.limit + "&";

  return str;
}

function callback4RangeSearch(err, result) {
  if (err) {
    smart.error(err,i18n["js.common.search.error"],false);
  } else {
    var logList = result.items;

    var tmpl = $('#tmpl_log_list').html()
      , container = $("#log_list")
      , index = 1;

    container.html("");
    _.each(result.items, function(row){
      container.append(_.template(tmpl, {
          "index": index++
        , "time": (moment(row.time).format("YYYY/MM/DD HH:mm:ss (ZZ)"))
        , "user": row.user
        , "host": row.host
        , "source": row.source
        , "type": row.type
        , "level": row.level
        , "category": row.category
        , "code": row.code
        , "_id": row._id
      }));
    });

    if(logList.length == 0) {
      container.html("<tr><td colspan=10>" + i18n["js.common.list.empty"] + "</td></tr>");
    }

    // 设定翻页
    smart.pagination($("#pagination_area"), result.totalItems, 20, function(active) {
      doSearch(active, 20, callback4RangeSearch);
    });
  }
}

var totalFetched = 0;
var callCount = 0;
function callback4RealTimeSearch(err, result) {
  if (err) {
    smart.error(err,i18n["js.common.search.error"],false);
  } else {
    var logList = result.items;

    var tmpl = $('#tmpl_log_list').html()
      , container = $("#log_list");

    _.each(result.items, function(row){
      totalFetched++;
      if(totalFetched % clearBy === 0) {
        var trs = container.children("tr");
        if(trs.length > bufSize) {
          var removeCount = trs.length - bufSize;
          trs.each(function() {
            if(removeCount > 0) {
              $(this).remove();
              removeCount--;
            }
          });
        }
      }

      recentResultTime = row.time;
      container.append(_.template(tmpl, {
          "index": ""
        , "time": (moment(row.time).format("YYYY/MM/DD HH:mm:ss (ZZ)"))
        , "user": row.user
        , "host": row.host
        , "source": row.source
        , "type": row.type
        , "level": row.level
        , "category": row.category
        , "code": row.code
        , "_id": row._id
        }));

      if(row.level === "error") {
        $("#statusBox").html(Number($("#statusBox").html()) + 1);
        $("#statusBox").removeClass("okStatus").addClass("ngStatus");
      }

      document.body.scrollTop = 1000000;
    });

    if(realTimeStarted === true) {
      callCount++;
      if(callCount % 2 === 0) {
        $("#stopBtn2").css("border", "1px solid black");
      } else {
        $("#stopBtn2").css("border", "0");
      }

      setTimeout(function() {
        doSearch(0, bufSize, callback4RealTimeSearch);
      }, timeout);
    }
  }
}

function showDetail(src) {
  var logId = $(src).attr("_id");
  if($(src).hasClass("icon-plus-sign")) {
    $(src).removeClass("icon-plus-sign").addClass("icon-minus-sign");
    if($("#" + logId).length > 0) {
      $("#" + logId).show();
    } else {
      getLogDetail(logId, function(err, detail) {
        if (err) {
          smart.error(err,i18n["js.common.search.error"],false);
        } else {
          var detailHtml = _.template($("#tmpl_log_detail").html(), {
            "_id": detail._id
            , "file": detail.file
            , "line": detail.line
            , "message": detail.message
          });
          $(src).parent().parent().after(detailHtml);
        }
      });
    }
  } else {
    $(src).removeClass("icon-minus-sign").addClass("icon-plus-sign");
    $("#" + logId).hide();
  }
}

function getLogDetail(id, callback) {
  smart.doget("/admin/log/detail.json?id=" + id, callback);
}