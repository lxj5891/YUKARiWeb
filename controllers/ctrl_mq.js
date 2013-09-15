var amqp = require('amqp')
  , mq = require('config').mq;

/**
 * MQ连接参数
 */
var args = {
    "host": mq.host
  , "port": mq.port
  , "user": mq.user
  , "password": mq.password
};

/**
 * 合并图片
 *
 * @param message
 * {
 *   id: '5211deecf4d1e1b43f000008',
 *   files: [
 *     {fid: '521207d9337de64f44000001', x: '0',   y:'0',   w:'200', h:'200'},
 *     {fid: '52120894f9cab55d44000001', x: '250', y:'0',   w:'200', h:'200'},
 *     {fid: '521c2388d6c475a09c12327b', x: '480', y:'100', w:'500', h:'500'}
 *   ],
 *   width: '1024',
 *   height: '768',
 *   collection: 'layouts',
 *   key: 'layout.page.image'
 * }
 */
exports.joinImage = function(message) {

  args.queue = mq.queue_join;
  var connection = amqp.createConnection(args);

  connection.on("ready", function(){
    connection.publish(mq.queue_join, message, { mandatory: true }, function(){
      connection.end();
    });
  });
};

/**
 * 发送消息
 * @param message
 * {
 *   target: 用户ID
 *   body: 消息
 * }
 */
exports.pushApnMessage = function(message){

  args.queue = mq.queue_apn;
  var connection = amqp.createConnection(args);

  connection.on("ready", function(){
    connection.publish(mq.queue_apn, message, { mandatory: true }, function(){
      connection.end();
    });
  });
};

/**
 * 生成缩略图
 * @param message
 * {
 *   id:
 *   fid:
 *   x:
 *   y:
 *   width:
 *   height:
 *   ratio:
 * }
 */
exports.thumb = function(message){

  args.queue = mq.queue_thumb;
  var connection = amqp.createConnection(args);

  connection.on("ready", function(){
    connection.publish(mq.queue_thumb, message, { mandatory: true }, function(){
      connection.end();
    });
  });
};

