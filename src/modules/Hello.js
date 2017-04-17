const heartbeats    = require('heartbeats');
const debug         = require('debug')('module-hello');
const uuid          = require('uuid');
const TicketManager = require('./../utils/TicketManager');
const PidboxEvent   = require('./../events/PidboxEvent');
/**
 * Bootstep sending event heartbeats.
 * This service sends a ``worker-heartbeat`` message every n seconds.
 * Note: Not to be confused with AMQP protocol level heartbeats.
 */
class Hello {

  constructor() {
    this.ticketManager = new TicketManager();
  }

  /**
   * @param {Worker} worker
   * @param {Configuration} config
   */
  configure(worker, config) {
    this.worker = worker;
    this.config = config;
  }

  initialize() {
    this._setListeners();
    this._sayHello();
  }

  _sayHello() {
    const ticket = this.ticketManager.addTicket(1000, 'hello-ticket');
    const pidboxEvent = new PidboxEvent(ticket, 'hello');
    this.worker.emit('module.pidbox.publish', pidboxEvent)
  }

  _setListeners() {
    this.worker.on('module.hello.say', this._sayHello);
  }
}

module.exports = Hello;