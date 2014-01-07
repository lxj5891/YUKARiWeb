/**
 * Created by zhaobing on 14/01/06.
 */
var file     =smart.ctrl.file;

exports.save = function(handler,callback){

  var filearray;

  if (handler.req.files.files instanceof Array) {
    filearray = handler.req.files.files;
  } else {
    filearray = [];
    filearray.push(handler.req.files.files);
  }
  handler.addParams("files",filearray);
  file.add(handler, function(err, result){
    if(err){
      return callback(new error.InternalServer(err));
    }
    callback(err,result);
  });
};