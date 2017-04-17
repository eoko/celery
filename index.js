const debug  = require('debug')('server');
const Worker = require('./src/Worker');
const worker = new Worker();
const Task = require('./src/utils/Task');

worker.addTask(new Task({
  script: 'sample.js',         // Script to be run
  exec_mode: 'cluster',        // Allow your app to be clustered
  name: 'task.transcodeMedia',
  instances: 2,                // Optional: Scale your app by 4
  max_memory_restart: '100M'   // Optional: Restart your app if it reaches 100Mo
}));

worker.init();
////
//worker
//  .on('ready', () => {
//    worker.init();
//    debug('READY!!!')
//  })
//  .on('error', (e) => {
//    debug(e);
//  });

//var celery   = require('node-celery');
//const client = celery.createClient(
//  {
//    CELERY_BROKER_URL: 'amqp://guest:guest@localhost:5672//',
//    CELERY_ROUTES: {
//      'tasks.send_mail': {
//        queue: 'mail'
//      }
//    }
//  }
//);
//
//client.on('error', function (err) {
//  console.log(err);
//});
//
//client.on('connect', function() {
//  let i = 1000;
//
//  while(i > 0) {
//
//    const result = client.call('tasks.send_email', []);
//    result.on('ready', function(data) {
//      console.log(data);
//    });
//
//    i--;
//  }
//
//});