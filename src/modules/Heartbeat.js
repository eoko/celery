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
    return {
      interval: 2000,
      notify: true,
    }
  }

  constructor() {
    /** beats count the current heartbeat */
    this.beats = 0;
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
    this.beats    = 0;
  }

  /**
   * At the initialization step, the heart beat
   */
  initialize() {
    this.heart = heartbeats.createHeart(this.config('interval'));
    this._start();
  }

  /**
   * Listen event emitted by the Worker.
   *
   * @param {Worker.on} on
   * @see https://github.com/asyncly/EventEmitter2#emitteronevent-listener
   */
  setListeners(on) {
    on('module.heartbeat.start', this._beat);
    on('module.heartbeat.stop', this._stop);
  }

  /**
   * Called when the application end. The error is provided if the application end on error
   *
   * @param {Worker.emit} emit
   * @param {Error|null} err Error if provided
   */
  end(emit, err) {
    if(err) debug(err);
    this._stop(emit);
  }

  /**
   * @private
   */
  _stop() {
    this.heart.kill();
    this.worker.emit('module.heartbeat.stop');
  }

  _start() {
    this.worker.emit('module.heatbeat.start');
    this.heart.createEvent(1, () => this._beat());
  }

  /**
   * @param {Worker.emit} emit
   *
   * @private
   */
  _beat() {
    this
      .worker
      .state
      .refresh()
      .then(state => {
        this.beats++;
        this.worker.emit('module.heartbeat.beat');

        if (this.config('notify')) {
          this.worker.emit('worker.dispatch.heartbeat', state.toJson())
        }
      });
  }
}

module.exports = Heartbeat;