const heartbeats = require('heartbeats');
const debug = require('debug')('module-tasks');
const uuid = require('uuid');
const TicketManager = require('./../utils/TicketManager');
const PidboxEvent = require('./../events/PidboxEvent');
const _ = require('lodash');
/**
 * Bootstep sending event heartbeats.
 * This service sends a ``worker-heartbeat`` message every n seconds.
 * Note: Not to be confused with AMQP protocol level heartbeats.
 */
class Info {

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
  }

  _setListeners() {
    this.worker.on('module.pidbox.direct.registered', (ev) => this._publishTasks(ev));
    this.worker.on('module.pidbox.direct.stats', (ev) => this._publishStats(ev));
    this.worker.on('module.pidbox.direct.conf', (ev) => this._publishConfig(ev));
  }

  _publishTasks(ev) {
    debug('new stats');
    const routingKey = ev.reply_to.routing_key;
    const exchange   = ev.reply_to.exchange;
    const content    = {};

    content[this.worker.state.hostname] = _.map(this.worker.tasks, 'name');

    this.worker.emit(`module.pidbox.reply`, { exchange, routingKey, content });
  }

  _publishConfig(ev) {
    debug('new config');
    const routingKey = ev.reply_to.routing_key;
    const exchange   = ev.reply_to.exchange;
    const content    = {};

    content[this.worker.state.hostname] = {
      "CELERY_RESULT_BACKEND": "amqp",
      "include": ["celery.app.builtins", "tasks"],
      "CELERY_RESULT_SERIALIZER": "json",
      "CELERY_ENABLE_UTC": true
    };

    this.worker.emit(`module.pidbox.reply`, { exchange, routingKey, content });
  }

  _publishStats(ev) {
    debug('new stats');
    const routingKey = ev.reply_to.routing_key;
    const exchange   = ev.reply_to.exchange;
    const content    = {};

    content[this.worker.state.hostname] = content[this.worker.state.hostname] = {
      "prefetch_count": 32,
      "clock": "130497",
      "total": {},
      "pid": 67059,
      "broker": {
        "hostname": "127.0.0.1",
        "userid": "guest",
        "virtual_host": "/",
        "port": 56722,
        "insist": false,
        "ssl": false,
        "transport": "amqp",
        "connect_timeout": 4,
        "transport_options": {},
        "login_method": "AMQPLAIN",
        "uri_prefix": null,
        "heartbeat": 120.0,
        "failover_strategy": "round-robin",
        "alternates": []
      },
      "pool": {
        "processes": [67065, 67066, 67067, 67068, 67069, 67070, 67071, 67072],
        "max-tasks-per-child": "N/A",
        "timeouts": [0, 0],
        "writes": {
          "all": "",
          "avg": "0.00%",
          "inqueues": { "active": 0, "total": 8 },
          "strategy": "fair",
          "raw": "",
          "total": 0
        },
        "put-guarded-by-semaphore": false,
        "max-concurrency": 8
      },
      "rusage": {
        "majflt": 0,
        "ixrss": 0,
        "minflt": 29835,
        "inblock": 0,
        "nsignals": 0,
        "nswap": 0,
        "idrss": 0,
        "msgrcv": 225,
        "maxrss": 31670272,
        "isrss": 0,
        "nvcsw": 66,
        "oublock": 0,
        "stime": 0.11963599999999999,
        "msgsnd": 49,
        "nivcsw": 324,
        "utime": 0.359403
      }
    };

    this.worker.emit(`module.pidbox.reply`, { exchange, routingKey, content });
  }
}

module.exports = Info;