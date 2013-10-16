$(function () {
  'use strict';

  var layoutData = {};

  var rowMax = 3, colMax = 3;
//  var tileWidth = 340 * 0.5, tileHeight = 239 * 0.5;
  var tileWidth = 180, tileHeight = 136;
  var borderWidth = 10;
  var screenSort = [];
  var screenCounter = 0;
  var caseMenuSort = [];
  var caseMenuCounter = 0;


  bindEvents();

  var layoutId = $('#layoutId').val();
  var isCopy = $('#isCopy').val();
  if (layoutId == 0) {//新规
    layoutData = {
      layout: {
        name: '',
        page: [
          { type: 1, tile: []},
          {type: 2, tile: []}
        ]
      }
    };
    render();
  } else {
    console.log(layoutId);
    var url = '/layout/get.json?id=' + layoutId;
    smart.doget(url, function (err, result) {
      if(smart.error(err,'',true)){
        return;
      }

      layoutData = result;
      if(isCopy == "true"){
        delete layoutData._id;
        layoutData.layout.name += i18n["js.public.common.copy"];
      }

      console.log(layoutData);

      render();
    });
  }

  function bindEvents(){
//    $('#showLandscape').on('click', function () {
//      $('#layoutLandscape').show();
//      $('#layoutPortrait').hide();
//    });
//
//    $('#showPortrait').on('click', function () {
//      $('#layoutLandscape').hide();
//      $('#layoutPortrait').show();
//    });

    $('#addCaseMenu').on('click', function(){
      showSyntheticList('CaseView',function(selectedId,synthetic){
        var num = ++caseMenuCounter;
        var tile = {};
        tile.type = 2;
        tile.syntheticId = selectedId;
        tile.synthetic = synthetic;
        tile.num = num;
        caseMenuSort.push(num);

        var setting = getTilesSetting(2);
        setting.tile.push(tile);
        console.log(setting);
        createCaseMenuWithTile(tile);
        setCaseImage(tile);
      });
    });

    $('#addLayoutScreen').on('click', function(){
      insertLandscapeScreenAfter(-1);
    });

    $('#selectContents').modal("hide");
//  $('#addCase').on("click", function () {
//    $('#selectContents').modal("show");
//  });
    $('#selectedContents').click(
      function () {
        $('#selectContents').modal("hide");
      }
    );
    $('#savemodal').modal("hide");
    $('#inputInfo').on("click", function () {
      $('#savemodal').modal("show");
    });
    $('#comfirmOK').on('click', function () {
      $('#savemodal').modal("hide");
      setInfo($('#inputName').val(), $('#inputComment').val());
    });
    $('#comfirmCancel').on('click', function () {
      $('#savemodal').modal("hide");
    });

    $('#saveLayout').on('click', function () {

      saveLayout(1);
    });

    $('#saveAndApply').on('click', function () {

      saveLayout(2);
    });

    $('.carousel-control').on('click', function(){
      var scroll = $('#caseMenuScrollDiv');
      var offset = scroll.attr('offset');
      offset = parseInt(offset);
      if($(this).hasClass('right')){
        offset += 135;
        scroll.scrollLeft(offset);
      } else {
        offset -= 135;
        offset = offset < 0 ? 0 : offset;
        scroll.scrollLeft(offset);
      }
      scroll.attr('offset',offset);
    });
  }

  function preSubmit(){
    // check
    if(_.isEmpty($.trim(layoutData.layout.name))){
      Alertify.log.error(i18n["js.public.check.layout.title"]);
      return false;
    }

    // layout
    var tileNum = 0;
    var newTiles = [];
    var newSort = [];
    _.each(screenSort, function(screen,idx){
      for(var orgNum = 1; orgNum <= colMax * rowMax; orgNum++){
        tileNum ++;
        var orgTile = getLandscapeTileInScreen(screen, orgNum);
        var tile = {};
        tile.num = tileNum;
        tile.rowspan = orgTile.rowspan;
        tile.colspan = orgTile.colspan;
        if(orgTile.syntheticId){
          tile.syntheticId = orgTile.syntheticId;
          tile.synthetic = orgTile.synthetic;
        }
        newTiles.push(tile);
      }
      newSort.push(idx+1);
    });
    screenSort = newSort;
    getTilesSetting(1).tile = newTiles;

    //caseMenu
    var newMenuSort = [];
    _.each(caseMenuSort,function(menuNum,idx){
      var tile = getPortraitTile(menuNum);
      var newNum = idx + 1;
      tile.num = newNum;
      newMenuSort.push(newNum);
    });
    caseMenuSort = newMenuSort;

    return true;
  }

  function saveLayout(status_) {
    var url = '';
    if (!layoutData._id) {//新规
      url = "/layout/add.json";
    } else {
      url = "/layout/update.json";
    }
    //if (status_ == 2 && !layoutData.confirmby) {
    //  alert('承認者を指定してください。');
    //  return;
    //}
    layoutData.status = status_;
    layoutData.layout.name = $('#layoutName').val();
    layoutData.layout.comment = $('#layoutComment').val();

    if(!preSubmit()){
      return;
    }
    console.log(layoutData);
    console.log('screenSort',screenSort);
    console.log('caseMenuSort',caseMenuSort);

    smart.dopost(url, layoutData, function (err, result) {
      if (smart.error(err,i18n["js.common.save.error"],false)) {
        render();
        return;
      }
      layoutData = result.data;
      render();
      console.log(result);
      Alertify.log.success(i18n["js.common.save.success"]);
    });
  }

  function render() {
//    $('#layoutPortrait').hide();
    if(layoutData.layout.name){
      $('#layoutName').val(layoutData.layout.name);
    }
    if(layoutData.layout.comment){
      $('#layoutComment').val(layoutData.layout.comment);
    }

    var panel = $('#layoutLandscape');
    panel.html('');
    var count = getLandscapeScreenCount()||1;

    screenSort = [];
    screenCounter = 0;
    caseMenuSort = [];
    caseMenuCounter = 0;

    for(var i = 0; i < count; i++){
      insertLandscapeScreenAfter(-1);
    }

    redrawPortraitLayout();

  }

  function setInfo(name, comment){
    layoutData.layout.name = name;
    layoutData.layout.comment = comment;

    // 承認者
    //var confirmby;
    //$("#textBoxConfirm li").each(function() {
    //  if ("user" == $(this).attr("type")) {
    //    layoutData.confirmby = $(this).attr("uid");
    //  }
    //  last;
    //});
  }

  function insertLandscapeScreenAfter(screenNum){
    screenNum = parseInt(screenNum);

    var tiles = getTilesSetting(1).tile;

    var newScreenMun = ++screenCounter;
    var tileNumStart = (newScreenMun - 1) * colMax * rowMax +1;

    var asFirst = screenNum == 0;
    var asLast = screenNum == -1;
    if(asFirst){//first
      screenSort.unshift(newScreenMun)
    } else if(asLast){//last
      screenSort.push(newScreenMun);
    } else {
      var newSort = [];
      _.each(screenSort, function(screen){
        newSort.push(screen);
        if(screen == screenNum){
          newSort.push(newScreenMun);
        }
      });
      screenSort = newSort;
    }

    if(newScreenMun>getLandscapeScreenCount()){
      for(var i = 0; i < colMax * rowMax; i++){
        var newTile = {};
        newTile.num = tileNumStart + i;
        newTile.rowspan = 1;
        newTile.colspan = 1;
        tiles.push(newTile);
      }
    }

    console.log(screenSort);

    var ul = $('#layoutLandscape');

    var li = $('<li/>');
    li.attr('id','layoutLandscapePanel'+newScreenMun);
    li.addClass('layout');

    var table = $('<table/>');
    table.attr('id','layoutLandscape'+newScreenMun);
    table.attr('screen',newScreenMun);
    table.attr("width", tileWidth * colMax);
    table.attr("height", tileHeight * rowMax);
    li.append(table);

    var tools = _.template($('#tmpl_layout_toolbox').html(),{screen:newScreenMun});
    li.append(tools);

//    li.append($('<div class="tools tools-right"><a href="#"><i class="icon-link"></i></a><a href="#"><i class="icon-paper-clip"></i></a><a href="#"><i class="icon-pencil"></i></a><a href="#"><i class="icon-remove red"></i></a></div>'));
    if(asFirst || asLast){
      ul.append(li);
    } else{
      var beforeDiv = $('#layoutLandscapePanel' + screenNum);
      beforeDiv.after(li);
    }

    $("#layoutTools_" + newScreenMun +" i").on('click', function(){
      var tool = $(this);
      var opt = tool.attr('option');
      if( opt == 'remove'){
        deleteLandscapeScreen(newScreenMun);
      }
      if(opt == 'up'){
        moveLandscapeScreenUp(newScreenMun);
      }
      if(opt == 'down'){
        moveLandscapeScreenDown(newScreenMun);
      }
    });
    createBorder(newScreenMun);
    redrawLandscapeLayout(newScreenMun);

  }

  function deleteLandscapeScreen(screenNum){
    screenNum = parseInt(screenNum);
    if(screenSort.length <= 1){
      console.log('Can not delete the last layout!');
      return;
    }

    var setting = getTilesSetting(1);
    var deleteTileNumStart = (screenNum - 1) * colMax * rowMax + 1;
    var deleteTileNumEnd = deleteTileNumStart + colMax * rowMax - 1;
    var newTiles = _.reject(setting.tile, function(tile){
      return tile.num >= deleteTileNumStart && tile.num <= deleteTileNumEnd;
    });
    setting.tile = newTiles;
    screenSort = _.reject(screenSort, function(screen){
      return screen == screenNum;
    });
    console.log(screenSort);
    console.log(setting);

    $('#layoutLandscapePanel'+screenNum).remove();
  }

  function moveLandscapeScreenUp(screenNum){
    screenNum = parseInt(screenNum);

    var currSortIdx = _.indexOf(screenSort,screenNum);
    if(currSortIdx > 0){

      var frontSortIdx = currSortIdx - 1;
      var frontScreenNum = screenSort[frontSortIdx];

      var currScreen = $('#layoutLandscapePanel'+screenNum);
      var frontScreen = $('#layoutLandscapePanel'+frontScreenNum);
      frontScreen.before(currScreen);

      screenSort[currSortIdx] = frontScreenNum;
      screenSort[frontSortIdx] = screenNum;
      console.log(screenSort);
    }
  }

  function moveLandscapeScreenDown(screenNum){
    screenNum = parseInt(screenNum);
    var currSortIdx = _.indexOf(screenSort,screenNum);
    if(currSortIdx >= 0 && currSortIdx < screenSort.length - 1){
      var behindSortIdx = currSortIdx + 1;
      var behindScreenNum = screenSort[behindSortIdx];
      var currScreen = $('#layoutLandscapePanel'+screenNum);
      var behindScreen = $('#layoutLandscapePanel'+behindScreenNum);
      behindScreen.after(currScreen);

      screenSort[currSortIdx] = behindScreenNum;
      screenSort[behindSortIdx] = screenNum;
      console.log(screenSort);
    }
  }

  function getTilesSetting(type) {
    return _.find(layoutData.layout.page, function (setting) {
      return setting.type == type;
    });
  }

  function getLandscapeTileInScreen(screenNum, tileNum) {
    screenNum = parseInt(screenNum);
    tileNum = parseInt(tileNum);
    var _num = tileNum + [screenNum - 1] * colMax * rowMax;
    var setting = getTilesSetting(1);
//    console.log(setting);
    return _.find(setting.tile, function (tile) {
      return tile.num == _num;
    });
  }

  function getLandscapeScreenCount(){
    var setting = getTilesSetting(1);
    var count = parseInt(setting.tile.length/(colMax * rowMax));
    return count;
  }

  function getPortraitMenuCount(){
    var setting = getTilesSetting(2);
    return setting.tile.length;
  }

  function getPortraitTile(tileNum){
    var setting = getTilesSetting(2);
    return _.find(setting.tile, function (tile) {
      return tile.num == tileNum;
    });
  }

  function createBorder(screenNum) {
    var table = $('#layoutLandscape'+screenNum);

    var tmpMax = colMax - 1;
    var verticalCss = {
      position: 'absolute',
      width: borderWidth + 'px',
      height: tileHeight + 'px'
    };
    for (var row = 1; row <= rowMax; row++) {
      for (var col = 1; col <= tmpMax; col++) {
        var borderNum = (row - 1) * tmpMax + col;
        var border = $('<div/>');
        border.attr('id', 'VerticalBorder_' + screenNum + '_' + borderNum);
        verticalCss.top = (row - 1) * tileHeight;
        verticalCss.left = col * tileWidth - borderWidth / 2;
        border.css(verticalCss);
        border.attr('num', borderNum);
        border.attr('screen', screenNum);
        border.addClass('vertical');

        border.on('click', function () {
          borderClick($(this));
        });

        table.after(border);
      }
    }

    var horizontalCss = {
      position: 'absolute',
      width: tileWidth + 'px',
      height: borderWidth + 'px'
    };
    tmpMax = rowMax - 1;
    for (var row = 1; row <= tmpMax; row++) {
      for (var col = 1; col <= colMax; col++) {
        var borderNum = (row - 1) * colMax + col;
        var border = $('<div/>');
        border.attr('id', 'HorizontalBorder_' + screenNum + '_' + borderNum);
        horizontalCss.top = row * tileHeight - borderWidth / 2;
        horizontalCss.left = (col - 1) * tileWidth;
        border.css(horizontalCss);
        border.attr('num', borderNum);
        border.attr('screen', screenNum);
        border.addClass('horizontal');
        border.on('click', function () {
          borderClick($(this));
        });

        table.after(border);
      }
    }
  }

  function redrawLandscapeLayout(screenNum) {
    var table = $('#layoutLandscape'+screenNum);
    table.html('');

    var html = '';
    for (var row = 1; row <= rowMax; row++) {
      var tr = $('<tr/>');
      table.append(tr);
      for (var col = 1; col <= colMax; col++) {
        var tileNum = (row - 1) * colMax + col;
        var tile = getLandscapeTileInScreen(screenNum, tileNum);
        if (tile.colspan > 0 && tile.rowspan > 0) {
          var td = $('<td/>');
          td.addClass('layout');
          td.attr("colspan", tile.colspan);
          td.attr("rowspan", tile.rowspan);
          td.attr("width", tileWidth);
          td.attr("height", tileHeight);
          td.attr("tileNum", tileNum);
          td.attr("screen", screenNum);
          var img = $('<img/>');
          if(tile.synthetic && tile.synthetic.cover && tile.synthetic.cover.length>0 && tile.synthetic.cover[0].material){
            var src = '/picture/' + tile.synthetic.cover[0].material.fileid;
            img.attr('src', src);
          }

          img.css({width: tileWidth * tile.colspan, height: tileHeight * tile.rowspan});

          td.append(img);
          tr.append(td);


          td.on('click', function () {
            var selectedTd = $(this);
            showSyntheticList('imageWithThumb,normal,gallery',function(syntheticId,synthetic){
              var num = selectedTd.attr("tileNum");
              var screen = selectedTd.attr("screen");
              var t = getLandscapeTileInScreen(screen, num);

              t.syntheticId = syntheticId;
              t.synthetic =synthetic;
              if(synthetic.cover && synthetic.cover.length>0 && synthetic.cover[0].material){
                var src = '/picture/' + synthetic.cover[0].material.fileid;
                selectedTd.find('img').attr('src', src);
              }
              console.log(t);
            });
          });

          displayBorder(screenNum);
        }
      }
    }
  }

  function addPortraitMenu(){

  }

  function redrawPortraitLayout(){
    var count = getPortraitMenuCount();

    var div = $('#caseMenuPanel');
    div.html('');
    for(var menuNum = 1; menuNum <= count; menuNum ++){
      var menuTile = getPortraitTile(menuNum);
      caseMenuCounter++;
      caseMenuSort.push(caseMenuCounter);
      createCaseMenuWithTile(menuTile);
    }
  }

  function createCaseMenuWithTile(menuTile){
    var ul = $('#caseMenuPanel');
    var menuNum = menuTile.num;
    var li = $('<li style="margin-right: 5px;"/>');
    li.attr('id', 'caseMenuContainer_'+menuNum);
    var img = $('<img/>');
    img.addClass('caseMenuImg');
    img.attr('id', 'caseMenu_'+menuNum);
    img.attr('num', menuNum);
    setCoverImage(img, menuTile);

    img.on('click', function(){

      var selectedMenu = $(this);
      var num = selectedMenu.attr('num');
      var tile = getPortraitTile(num);
      setCaseImage(tile);
    });

    li.append(img);
    var tools = _.template($('#tmpl_caseMenu_toolbox').html(),{menuNum:menuNum});
    li.append(tools);
    ul.append(li);

    $("#caseMenuTools_" + menuNum +" i").on('click', function(){
      var tool = $(this);
      var opt = tool.attr('option');
      if( opt == 'remove'){
        deleteCaseMenu(menuNum);
      }
      if(opt == 'right'){
        moveCaseMenuRight(menuNum);
      }
      if(opt == 'left'){
        moveCaseMenuLeft(menuNum);
      }
      if(opt == 'edit'){
        showSyntheticList('CaseView',function(selectedId,synthetic){
          updateCaseMenu(menuNum,synthetic);
        });
      }
    });
  }

  function deleteCaseMenu(menuNum){
    menuNum = parseInt(menuNum);
    var menuCount = getPortraitMenuCount();
    if(menuCount <= 1){
      console.log('Can not delete the last case!');
      return;
    }
    var setting = getTilesSetting(2);
    var newTiles = _.reject(setting.tile, function(tile){
      return tile.num == menuNum;
    });
    setting.tile = newTiles;

    caseMenuSort = _.reject(caseMenuSort, function(num){
      return num == menuNum;
    });

    $('#caseMenuContainer_'+menuNum).remove();
    console.log(caseMenuSort);
    console.log(setting);
  }

  function updateCaseMenu(menuNum,synthetic){
    menuNum = parseInt(menuNum);
    var tile = getPortraitTile(menuNum);
    tile.syntheticId = synthetic._id;
    tile.synthetic = synthetic;
    var img = $('#caseMenu_'+menuNum);
    setCoverImage(img, tile);
    setCaseImage(tile);
    console.log(tile);
  }

  function moveCaseMenuLeft(menuNum){
    menuNum = parseInt(menuNum);

    var currSortIdx = _.indexOf(caseMenuSort,menuNum);
    if(currSortIdx > 0){

      var frontSortIdx = currSortIdx - 1;
      var frontMenuNum = caseMenuSort[frontSortIdx];

      var currMenu = $('#caseMenuContainer_'+menuNum);
      var frontMenu = $('#caseMenuContainer_'+frontMenuNum);
      frontMenu.before(currMenu);

      caseMenuSort[currSortIdx] = frontMenuNum;
      caseMenuSort[frontSortIdx] = menuNum;
      console.log(caseMenuSort);
    }
  }

  function moveCaseMenuRight(menuNum){
    menuNum = parseInt(menuNum);
    var currSortIdx = _.indexOf(caseMenuSort,menuNum);
    if(currSortIdx >= 0 && currSortIdx < caseMenuSort.length - 1){
      var behindSortIdx = currSortIdx + 1;
      var behindMenuNum = caseMenuSort[behindSortIdx];
      var currMenu = $('#caseMenuContainer_'+menuNum);
      var behindMenu = $('#caseMenuContainer_'+behindMenuNum);
      behindMenu.after(currMenu);

      caseMenuSort[currSortIdx] = behindMenuNum;
      caseMenuSort[behindSortIdx] = menuNum;
      console.log(caseMenuSort);
    }
  }

  function setCoverImage(img, tile){
    if(tile.synthetic && tile.synthetic.cover && tile.synthetic.cover.length>0, tile.synthetic.cover[0].material){
      var src = '/picture/' + tile.synthetic.cover[0].material.fileid;
      img.attr('src', src);
    }
  }

  function setCaseImage(tile){
    var img = $('#caseView');
    if(tile.synthetic && tile.synthetic.metadata && tile.synthetic.metadata.length>0 && tile.synthetic.metadata[0].material){
      var src = '/picture/' + tile.synthetic.metadata[0].material.fileid;
      img.attr('src', src);
    }
  }

  function borderClick(border) {
    var screenNum = border.attr('screen');
    var tileNum = mainTileNumByBorder(screenNum, border);
    var targetTileNum = targetTileNumByBorder(border, tileNum);



    if (border.hasClass('dashBorder')) {
      splitTiles(screenNum, tileNum, targetTileNum);
    } else {
//      if(border.hasClass('vertical')){//横向合并
//        targetTileNum = tileNum + tiles[tileNum-1].colspan;
//      }else{
//        targetTileNum = tileNum + tiles[tileNum-1].rowspan * colMax;
//      }
      composeTiles(screenNum, tileNum, targetTileNum);
    }

  }

  function splitTiles(screenNum, tileNum, targetTileNum) {
    console.log(tileNum, targetTileNum);
    var in1Row = targetTileNum - tileNum < colMax;//横向分割
    var tile = getLandscapeTileInScreen(screenNum, tileNum);
    var targetTile = getLandscapeTileInScreen(screenNum, targetTileNum);

    if (in1Row) {//横向
      var offset = targetTileNum - tileNum;
      targetTile.colspan = tile.colspan - offset;
      targetTile.rowspan = tile.rowspan;
      tile.colspan = offset;
    } else {
      var offset = parseInt((targetTileNum - tileNum) / colMax);
      tile.rowspan += targetTile.rowspan;
      targetTile.colspan = tile.colspan;
      targetTile.rowspan = tile.rowspan - offset;
      tile.rowspan = offset;
    }
    redrawLandscapeLayout(screenNum);
  }

  function composeTiles(screenNum, tileNum, targetTileNum) {
    console.log(tileNum, targetTileNum);
    var in1Row = targetTileNum - tileNum < colMax;//横向合并
    var tile = getLandscapeTileInScreen(screenNum, tileNum);
    var targetTile = getLandscapeTileInScreen(screenNum, targetTileNum);


    var canCompose = function () {

      if (targetTile.colspan == 0 && targetTile.rowspan == 0) {
        return false;
      } else {
        if (in1Row) {
          return tile.rowspan == targetTile.rowspan;
        } else {
          return tile.colspan == targetTile.colspan;
        }
      }
    };


    if (!canCompose()) {
      console.log('can not compose tiles!');
      return false;
    }

    if (in1Row) {//横向合并
      tile.colspan += targetTile.colspan;
      targetTile.colspan = 0;
      targetTile.rowspan = 0;
    } else {
      tile.rowspan += targetTile.rowspan;
      targetTile.colspan = 0;
      targetTile.rowspan = 0;
    }

//    if (!tile.syntheticId) {
//      tile.syntheticId = targetTile.syntheticId;
//      tile.synthetic = targetTile.synthetic;
//    }
    redrawLandscapeLayout(screenNum);
  }

  function mainTileNumByBorder(screenNum, border) {
    var borderNum = border.attr('num');
    var row, col;//from 1
    if (border.hasClass('horizontal')) {
      row = parseInt((borderNum - 1) / colMax + 1);
      col = (borderNum - 1) % (colMax) + 1;
    } else {
      row = parseInt((borderNum - 1) / (colMax - 1) + 1);
      col = (borderNum - 1) % (colMax - 1) + 1;
    }

    for (var r = 1; r <= row; r++) {
      for (var c = 1; c <= col; c++) {
        var tmpNum = (r - 1) * colMax + c;
        var tmpTile = getLandscapeTileInScreen(screenNum, tmpNum);
        for (var i = 0; i < tmpTile.rowspan; i++) {
          for (var j = 0; j < tmpTile.colspan; j++) {
            var num = tmpNum + j + i * colMax;
            if (num == (row - 1) * colMax + col) {
              return tmpNum;
            }
          }
        }

//        if(row <= r-1 + tmpTile.rowspan && col <= c-1 + tmpTile.colspan){
//          return tmpNum;
//        }
      }
    }
  }

  function targetTileNumByBorder(border, orgTileNum) {
    var borderNum = border.attr('num');
    var row, col;
    if (border.hasClass('horizontal')) {
      row = parseInt((borderNum - 1) / colMax + 1);
      row++;
      col = (orgTileNum - 1) % colMax + 1;
    } else {
      row = parseInt(orgTileNum / colMax) + 1;
      col = (borderNum - 1) % (colMax - 1) + 1;
      col++;
    }
    return (row - 1) * colMax + col;
  }

  function displayBorder(screenNum) {
    var rowMax = 3, colMax = 3;
    var setRightAndLeftBorder = function (col, colspan) {
      if (col == 1) {//左端的块
        setTileBorder(screenNum, num, 'left', solidBorder);
        if (colspan > 1) {
          setTileBorder(screenNum, num, 'right', dashBorder);
        } else {
          setTileBorder(screenNum, num, 'right', solidBorder);
        }
      } else if (col == colspan) {//右端的
        setTileBorder(screenNum, num, 'right', solidBorder);
        setTileBorder(screenNum, num, 'left', dashBorder);
      } else {//中间的
        setTileBorder(screenNum, num, 'left', dashBorder);
        setTileBorder(screenNum, num, 'right', dashBorder);
      }
    };
    var setTopAnBottomBorder = function (row, rowspan) {
      if (row == 1) {//第一行
        setTileBorder(screenNum, num, 'top', solidBorder);
        if (rowspan > 1) {
          setTileBorder(screenNum, num, 'bottom', dashBorder);
        } else {
          setTileBorder(screenNum, num, 'bottom', solidBorder);
        }
      } else if (row == rowspan) {//下部的行
        setTileBorder(screenNum, num, 'top', dashBorder);
        setTileBorder(screenNum, num, 'bottom', solidBorder);
      } else {//中间的行
        setTileBorder(screenNum, num, 'top', dashBorder);
        setTileBorder(screenNum, num, 'bottom', dashBorder);
      }
    };

    for (var row = 1; row <= rowMax; row++) {
      for (var col = 1; col <= colMax; col++) {
        var tileNum = (row - 1) * colMax + col;
        var tile = getLandscapeTileInScreen(screenNum, tileNum);
        if (tile.colspan > 0 && tile.rowspan > 0) {
          //遍历一个区域
          for (var i = 0; i < tile.rowspan; i++) {
            for (var j = 0; j < tile.colspan; j++) {
              var offset = j + i * colMax;
              var num = tileNum + offset;

              setTopAnBottomBorder(i + 1, tile.rowspan);
              setRightAndLeftBorder(j + 1, tile.colspan);
            }
          }
        }
      }
    }
  }


  function setTileBorder(screenNum, tileNum, border, fn) {
    var tileBorderMap = {
      "1": {left: 0, right: 1, top: 0, bottom: 1},
      "2": {left: 1, right: 2, top: 0, bottom: 2},
      "3": {left: 2, right: 0, top: 0, bottom: 3},
      "4": {left: 0, right: 3, top: 1, bottom: 4},
      "5": {left: 3, right: 4, top: 2, bottom: 5},
      "6": {left: 4, right: 0, top: 3, bottom: 6},
      "7": {left: 0, right: 5, top: 4, bottom: 0},
      "8": {left: 5, right: 6, top: 5, bottom: 0},
      "9": {left: 6, right: 0, top: 6, bottom: 0}
    }
    var prefix = '';
    if (border == 'left' || border == 'right') {
      prefix = 'VerticalBorder_' + screenNum + '_';
    } else {
      prefix = 'HorizontalBorder_' + screenNum + '_';
    }
    var id = prefix  + (tileBorderMap[tileNum][border]);
    fn(id);
  }

  function dashBorder(id) {
    var border = $('#' + id);
    if (border) {
      border.removeClass("solidBorder").addClass("dashBorder");
    }
  }

  function solidBorder(id) {
    var border = $('#' + id);
    if (border) {
      border.removeClass("dashBorder").addClass("solidBorder");
    }
  }

  /*
  元素选择
   */
  function showSyntheticList(type,callback){

    $('#selectContents').modal("show");

  }

  function syntheticTypeString(type){
    if(type == 'imageWithThumb'){
      return i18n["js.public.info.synthetic.type.animation"];
    }
    if(type == 'normal'){
      return i18n["js.public.info.synthetic.type.imageset"];
    }
    if(type == 'gallery'){
      return i18n["js.public.info.synthetic.type.gallery"];
    }
    if(type == 'CaseView'){
      return i18n["js.public.info.synthetic.type.caseview"];
    }
  }

  // 初始化承认者
  //var view = smart.view("user").view;
  //view.initialize("textBoxConfirm");

});

