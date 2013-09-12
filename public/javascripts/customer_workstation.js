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
  list.push({name: "連絡・通達", url: "http://moe.dreamarts.co.jp/", icon: "desktop"});
  list.push({name: "行動予定", url: "http://moe.dreamarts.co.jp/", icon: "tablet"});
  list.push({name: "メール", url: "http://moe.dreamarts.co.jp/", icon: "comments"});
  list.push({name: "社内SNS", url: "http://moe.dreamarts.co.jp/", icon: "calendar-empty"});
  list.push({name: "問合せDB", url: "http://moe.dreamarts.co.jp/", icon: "bar-chart"});
  list.push({name: "営業レポート作成", url: "http://moe.dreamarts.co.jp/", icon: "envelope-alt"});
  list.push({name: "営業レポート一覧", url: "http://moe.dreamarts.co.jp/", icon: "folder-open-alt"});
  list.push({name: "顧客情報検索", url: "http://moe.dreamarts.co.jp/", icon: "envelope-alt"});
  list.push({name: "案件情報検索", url: "http://moe.dreamarts.co.jp/", icon: "folder-open-alt"});
  list.push({name: "営業予算管理", url: "http://moe.dreamarts.co.jp/", icon: "envelope-alt"});
  list.push({name: "営業資料・My書庫", url: "http://moe.dreamarts.co.jp/", icon: "folder-open-alt"});

  list.push({name: "VOCお客様の声", url: "http://moe.dreamarts.co.jp/", icon: "folder-open-alt"});
  list.push({name: "電子稟議決裁", url: "http://moe.dreamarts.co.jp/", icon: "folder-open-alt"});
  list.push({name: "アンケート調査", url: "http://moe.dreamarts.co.jp/", icon: "folder-open-alt"});
  list.push({name: "見積り作成", url: "http://moe.dreamarts.co.jp/", icon: "folder-open-alt"});

  var tmpl = $("#tmpl_sortable").html();
  _.each(list, function(item){
    $( "#sortable").append(_.template(tmpl, item));
  });

});