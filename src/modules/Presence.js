const heartbeats = require('heartbeats');
const debug      = require('debug')('worker-hearbeat');
/**
 * Bootstep sending event heartbeats.
 * This service sends a ``worker-heartbeat`` message every n seconds.
 * Note: Not to be confused with AMQP protocol level heartbeats.
 */
class Presence {

  defaults() {
    return {};
  }

  configure(worker, config) {
    this.worker = worker;
    this.config = config;
  }

  initialize() {
    this._offline();
    this._setListeners();
  }
  _online() {
    this.worker.emit('worker.dispatch.online', this.worker.state.toJson());
  }

  _offline() {
    this.worker.emit('worker.dispatch.offline', this.worker.state.toJson());
  }

  _setListeners() {
    this.worker.on('module.presence.online', () => this._online());
    this.worker.on('module.presence.offline', () => this._offline());
    this.worker.on('end', () => this._offline());
  }
}

module.exports = Presence;