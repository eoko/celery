const heartbeats = require('heartbeats');
const debug      = require('debug')('worker-queue');
const uuid       = require('uuid');
/**
 * Bootstep sending event heartbeats.
 * This service sends a ``worker-heartbeat`` message every n seconds.
 * Note: Not to be confused with AMQP protocol level heartbeats.
 */
class TaskQueue {

  /**
   * @param {Worker} worker
   */
  constructor(worker) {
    this.config     = worker.configManager.namespacedConfig('tasks');
    this.worker     = worker;
  }

  start(channel) {
    this.worker.on('worker.task.new', task => {
      // register task
      // create exchange, bind queue if necessary

      //channel
      //  .assertQueue(this.queueName, this.config('workerQueue.args'))
      //  .then(res => {
      //    return channel
      //      .bindQueue(this.queueName, this.exchange, this.routingKey)
      //      .then(res => {
      //        return channel
      //          .consume(this.queueName, (msg,a,b,c,d,e) => {
      //            //debug(`new msg from ${this.queueName}`);
      //            const msg2 = msg.content.toString();
      //            debug(msg2);
      //          });
      //      });
      //  });
    });

  }
}

module.exports = TaskQueue;