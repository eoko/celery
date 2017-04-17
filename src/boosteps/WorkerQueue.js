const heartbeats = require('heartbeats');
const debug      = require('debug')('worker-queue');
const uuid       = require('uuid');
/**
 * Bootstep sending event heartbeats.
 * This service sends a ``worker-heartbeat`` message every n seconds.
 * Note: Not to be confused with AMQP protocol level heartbeats.
 */
class WorkerQueue {

  /**
   * @param {Worker} worker
   */
  constructor(worker) {
    this.config     = worker.configManager.namespacedConfig('workers');
    this.worker     = worker;
    this.queueName  = `${this.config('workerQueue.prefix')}.${worker.state.uuid}`;
    this.exchange   = this.config('workerQueue.bind.exchange');
    this.routingKey = this.config('workerQueue.bind.routingKey');
  }

  start(channel) {
    channel
      .assertQueue(this.queueName, this.config('workerQueue.args'))
      .then(res => {
        return channel
          .bindQueue(this.queueName, this.exchange, this.routingKey)
          .then(res => {
            return channel
              .consume(this.queueName, (msg,a,b,c,d,e) => {
                //debug(`new msg from ${this.queueName}`);
                const msg2 = msg.content.toString();
                debug(msg2);
              });
          });
      });
  }
}

module.exports = WorkerQueue;