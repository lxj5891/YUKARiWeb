$(function () {
  'use strict';

  $( "#sortable" ).sortable({
    revert: true
  });
  $( "#draggable" ).draggable({
    connectToSortable: "#sortable",
    helper: "clone",
    revert: "invalid"
  });
  $( "ul, li" ).disableSelection();

  $('#setting_add').on('click', function () {
    var li;
    li = $("#sortable").find("li").first().clone();
    $("#sortable").first().prepend(li);
  });

  $( "#sortable").html();

  var list = [];
  list.push({name: "トップポータル", url: "http://moe.dreamarts.co.jp/", icon: "desktop"});
  list.push({name: "SPモードトップ", url: "http://moe.dreamarts.co.jp/", icon: "tablet"});
  list.push({name: "InquiryDB", url: "http://moe.dreamarts.co.jp/", icon: "comments"});
  list.push({name: "営業レポート作成", url: "http://moe.dreamarts.co.jp/", icon: "calendar-empty"});
  list.push({name: "営業レポート一覧", url: "http://moe.dreamarts.co.jp/", icon: "bar-chart"});
  list.push({name: "顧客情報検索", url: "http://moe.dreamarts.co.jp/", icon: "envelope-alt"});
  list.push({name: "案件情報検索", url: "http://moe.dreamarts.co.jp/", icon: "folder-open-alt"});
  list.push({name: "予材管理", url: "http://moe.dreamarts.co.jp/", icon: "tags"});
  list.push({name: "メール", url: "http://moe.dreamarts.co.jp/", icon: "cloud"});
  list.push({name: "スケジュール（iOS）", url: "http://moe.dreamarts.co.jp/", icon: "calendar"});
  list.push({name: "スケジュール（一覧表示）", url: "http://moe.dreamarts.co.jp/", icon: "calendar"});
  list.push({name: "iPadコンテンツ改善提案", url: "http://moe.dreamarts.co.jp/", icon: "pencil"});

  var tmpl = $("#tmpl_sortable").html();
  _.each(list, function(item){
    $( "#sortable").append(_.template(tmpl, item));
  });

});