const debug = require('debug')('dispatcher');

/**
 * Dispatch local event to the workers network
 * @class Dispatcher
 * @type Object
 */
class Dispatcher {

  /**
   *
   * @param {Worker} worker
   */
  constructor(worker) {
    this.config = worker.configManager.namespacedConfig('dispatcher');
    this.worker = worker;
  }

  /**
   * Listen event starting by `worker.dispatch.*` and send it to the worker queue
   *
   * @param {Channel} channel
   */
  start(channel) {
    const self = this;
    this.worker.on('worker.dispatch.*', function (message) {
      const msg = message || {};
      const type = this.event.slice(16);
      msg.type = `worker-${type}`;

      self._dispatch(channel, type, msg)
    });
  }

  /**
   * Dispatch to the worker exchange a new message
   *
   * @param channel
   * @param type
   * @param event
   *
   * @event worker.dispatch.new
   * @event worker.dispatch.error
   *
   * @private
   */
  _dispatch(channel, type, event) {
    const exchange = this.config('exchange', 'celeryev');
    const routingKey = `worker.${type}`;
    const msg = JSON.stringify(event);

    const result = channel.publish(exchange, routingKey, new Buffer(msg), {
      contentType: 'application/json',
      type: event.type,
      headers: { 'hostname': this.worker.state.hostname }
    });

    if (result) {
      debug('New message sent', exchange, routingKey, msg);
      this.worker.emit('worker.dispatcher.new');
    } else {
      debug('Cannot dispatch', exchange, routingKey, msg);
      this.worker.emit('worker.dispatcher.error');
    }
  }
}

/**
 * @type Dispatcher
 */
module.exports = Dispatcher;