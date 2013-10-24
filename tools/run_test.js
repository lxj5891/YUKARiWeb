var fs        = require("fs")
  , path = require('path')
  , exec      = require("child_process").exec
  , home      = path.resolve(__dirname , "..")
  , coverage  = home + "/coverage/";

if (!fs.existsSync(__dirname + "/package.json")) {
  return console.log("NG! Please run the command in the project home directory.");
}

/**
 * 执行sh命令
 * @param command 命令
 * @param callback 执行完命令后的回调函数
 * @returns {*}
 */
function runCommand(command, callback) {

  var child = exec(command, function (error, stdout, stderr) {
    callback(error, stdout);
  });

  return child;
};


/**
 * 清除文件，生成converage代码，并执行测试case
 */
runCommand("rm -rf " + coverage, function(err, result){
  if (err) {
    return console.log(err);
  }

  // 创建文件夹
  fs.mkdirSync(coverage);

  // 生成converage代码
  var routes      = "jscoverage " + home + "/routes/ " + coverage + "routes/";
  var api         = "jscoverage " + home + "/api/ " + coverage + "api/";
  var controllers = "jscoverage " + home + "/controllers/ " + coverage + "controllers/";
  var modules     = "jscoverage " + home + "/modules/ " + coverage + "modules/";
  var core        = "jscoverage " + home + "/core/ " + coverage + "core/";
  runCommand(routes, function(err, result){});
  runCommand(api, function(err, result){});
  runCommand(controllers, function(err, result){});
  runCommand(modules, function(err, result){});
  runCommand(core, function(err, result){});

  // 执行测试代码，生成报告
  var test = "mocha -R html-cov test/*/* --coverage > coverage/coverage.html";
  runCommand(test, function(err, result){
    if (err) {
      return console.log(err);
    }

    // 执行成功
    console.log("OK!");
  });

});
