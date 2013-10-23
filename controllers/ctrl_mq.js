var amqp = require('amqp')
  , mq = require('config').mq;

var connectionMap = {};
/**
 * MQ连接参数
 */
var args = {
    "host": mq.host
  , "port": mq.port
  , "user": mq.user
  , "password": mq.password
};

var queOption = {
    durable: true
    ,autoDelete: false
    ,confirm: false
}

var messOption = {
    mandatory: true
    ,deliveryMode: 2
}

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

  mqConnection(mq.queue_join, message);
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

  mqConnection(mq.queue_apn, message);
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

  mqConnection(mq.queue_thumb, message);
};

function mqConnection(mq_queue, message){
  getConnection(mq_queue, function(connection){
    connection.publish(mq_queue, message, messOption);
  });
};


function getConnection(queue_name, callback) {
  if(connectionMap[queue_name]) {
    return callback(connectionMap[queue_name]);
  }

  args.queue = queue_name;
  var connection = amqp.createConnection(args);
  connection.on("ready", function(){
    connection.queue(queue_name, queOption, function (queue) {

      connectionMap[queue_name] = connection;
      return callback(connection);
    });
  });
}
