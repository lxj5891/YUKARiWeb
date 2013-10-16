$(function () {
  'use strict';
// 添加插件

  $contents.view.solutionList = {

    initSolutionlistFromMetadata: function (metadata) {
      var that = this;

      _.each(metadata, function (e, i) {
        var _solution = e.widget;
        store.cleanWidget(e.metadata_id);
        for (var _i in _solution) {
          var data = _solution[_i];
          var _obj = new SolutionFace();

          var create_obj = _obj.create(data,1);
          create_obj.init();
          store.addSolution(e.metadata_id, create_obj);
        }

      });
//      that.showSolutionmapPage(undefined);
    },
    showSolutionPanel :function(){
      $("#solution_panel form").css("display","block");
    }
  }

  $("#btn_add_solution").bind("click", function (event) {
    if(store.cur_metadata_id.length==0){
      Alertify.log.error(i18n["js.public.check.widget.length"]);
      return;
    }
    var _obj = new SolutionFace();
    var solution_obj = {
      title: undefined,
      name: i18n["js.public.info.widget.name"] + store.solution_index,
      index: store.solution_index,
      solution_id: "solution" + store.solution_index,
      width: 100,
      height: 100,
      top: 0,
      left: $("#solutionmap_preview").scrollLeft(),
      background: undefined,
      effect: undefined,
      action: undefined,
      metadata_id: store.cur_metadata_id,
      page: store.cur_metadata_id
    };
    var create_obj = _obj.create(solution_obj);
    create_obj.init();
    store.addSolution(store.cur_metadata_id, create_obj);

    return false;
  });

  if(store.type  == store._synthetic_type.solutionmap){
    $contents.view.solutionList.initSolutionlistFromMetadata(store.metadata);
  }
});

