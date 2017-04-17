const heartbeats = require('heartbeats');
const debug      = require('debug')('worker-hearbeat');

/**
 * Bootstep sending event heartbeats.
 * This service sends a ``worker-heartbeat`` message every n seconds.
 * Note: Not to be confused with AMQP protocol level heartbeats.
 */
class Heartbeat {

  /**
   * Defaults can be a function
   * @returns {Object}
   */
  defaults() {
    this.uuid = uuid.v4();

    return {
      interval: 2000,
      notify: true,
    }
  }

  /**
   * Defaults can be provided in the constructor
   */
  constructor() {
    // if the `name`or `__namespace` is unavailable, an random one will be generated
    // alternatively `this.name = 'sample'` can be used
    this.__namespace = 'sample';

    this.defaults = {
      interval: 2000,
      notify: true,
    };
  }

  /**
   * Called when the module is added to the worker.
   * The configuration provided is merged between `this.defaults` and `worker.config.${__namespace}`
   *
   * If `__namespace` is undefined, we will fallback to the class/function name
   *
   * The Worker instance is injected and can be referenced locally for further usage
   *
   * @param {Worker} worker
   * @param {_.get} config
   */
  configure(worker, config) {
    this.config   = config;
    this.worker   = worker;
    this.interval = this.config('interval', 2000);
    this.notify   = this.config('notify', true);
    this.beats    = 0;
  }

  /**
   * Called when the module is initialized by the worker.
   *
   * @returns {Promise} Return an optional promise
   */
  initialize() {
    this.heart = heartbeats.createHeart(this.interval);
    return Promise.resolve();
  }

  /**
   * Listen event emitted by the Worker.
   *
   * @param {Worker.on} on
   * @see https://github.com/asyncly/EventEmitter2#emitteronevent-listener
   */
  listener(on) {
    on('worker.heartbeat.beat', function sample() {});
  }

  /**
   * Emit an event
   *
   * @param {Worker.emit} emit
   * @see https://github.com/asyncly/EventEmitter2#emitteremitevent-arg1-arg2-
   */
  emitter(emit) {
    emit('sample.aaaa', 'sample message');
  }

  /**
   * Called when the application end. The error is provided if the application end on error
   *
   * @param {Error|null} err Error if provided
   */
  end(err) {
    this._stop(err);
  }

  /**
   * Sample private class prefixed for better readability
   * @param {Error} err
   * @private
   */
  _stop(err) {
    throw new Error('éé');
  }
}

module.exports = Heartbeat;