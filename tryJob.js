const celery = require('node-celery'),
      client = celery.createClient({
        CELERY_BROKER_URL: 'amqp://guest:guest@localhost:5672//',
      });

client.on('error', function (err) {
  console.log(err);
});


client.on('connect', function() {
  client.call('tasks.prout', [], {
    eta: new Date(Date.now() + 1000) // an hour later
  });
});