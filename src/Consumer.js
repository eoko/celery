const debug = require('debug')('consumer');
const amqp  = require('amqplib');

class Consumer {

  constructor(worker) {
    this.config = worker.configManager.namespacedConfig('consumer');
    this.worker = worker;
  }

  start() {
    return amqp
      .connect(this.config('connection.broker'), this.config('connection.args', {}))
      .then(conn => conn.createChannel(this.config('channel.args')))
      .then(ch => {
        this.worker.emit('consumer.ready');
        return ch;
      })
      .catch(err => {
        debug(err);
        this.worker.emit('error', err);
        throw err;
      });
  }
}

module.exports = Consumer;