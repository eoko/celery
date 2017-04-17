const TicketManager = require('./../utils/TicketManager');
const Ticket        = require('./../utils/Ticket');
const debug         = require('debug')('worker-queue');
const uuid          = require('uuid');
const _             = require('lodash');
/**
 * Bootstep sending event heartbeats.
 * This service sends a ``worker-heartbeat`` message every n seconds.
 * Note: Not to be confused with AMQP protocol level heartbeats.
 */
class Pidbox {

  defaults() {
    const routingKey = uuid.v4();

    return {
      reply: {
        queue: {
          routingKey: routingKey,
          name: `${routingKey}.reply.celery.pidbox`,
          args: { exclusive: false, autoDelete: true, durable: false },
        },
        exchange: {
          name: `reply.celery.pidbox`,
          type: 'direct',
          args: { exclusive: false, autoDelete: false, durable: false }
        }
      },
      pidbox: {
        exchange: {
          name: `celery.pidbox`,
          type: 'fanout',
          args: { exclusive: false, autoDelete: false, durable: false }
        },
        queue: {
          args: { exclusive: false, autoDelete: true, durable: false },
        }
      }
    }
  }

  constructor() {
    this.tickets = new TicketManager();
  }

  configure(worker, config) {
    this.worker = worker;
    this.config = config;
  }

  /**
   * At the initialization step, the heart beat
   */
  initialize(ch) {
    return ch
      .assertExchange(
        this.config('reply.exchange.name'),
        this.config('reply.exchange.type'),
        this.config('reply.exchange.args'))
      .then(() => ch.assertQueue(this.config('reply.queue.name'), this.config('reply.queue.args')))
      .then(() => ch.bindQueue(this.config('reply.queue.name'), this.config('reply.exchange.name'), this.config('reply.queue.routingKey')))
      .then(() => {
        return ch
          .consume(
            this.config('reply.queue.name'),
            (msg, a, b, c, d, e) => {
              debug(`new reply from ${this.queueName}`);
              //debug(msg);
            })
      })
      .then(() => ch.assertExchange(this.config('pidbox.exchange.name'), this.config('pidbox.exchange.type'), this.config('pidbox.exchange.args')))
      .then(() => ch.assertQueue(`${this.worker.state.hostname}.celery.pidbox`, this.config('pidbox.exchange.name'), '', this.config('pidbox.queue.args')))
      .then(() => ch.bindQueue(`${this.worker.state.hostname}.celery.pidbox`, this.config('pidbox.exchange.name')))
      .then(() => ch.consume(`${this.worker.state.hostname}.celery.pidbox`, ev => {
        const content = JSON.parse(ev.content.toString());
        const method  = _.isString(content.method) ? content.method : null;

        if (content.destination === null) {
          debug('new broadcast question pidbox');
          if (content.method) {
            this.worker.emit(`module.pidbox.broadcast.${method}`, content);
          } else {
            this.worker.emit('module.pidbox.broadcast', content);
          }
        }

        if (content.destination !== null && content.destination.includes(this.worker.state.hostname)) {
          debug('new direct question pidbox', method);
          if (content.method) {
            this.worker.emit(`module.pidbox.direct.${method}`, content);
          } else {
            this.worker.emit('module.pidbox.direct', content);
          }
        }
      }))
      .then(() => {
        this.worker.on(`module.pidbox.reply`, ev => {
          ch.publish(ev.exchange, ev.routingKey, new Buffer(JSON.stringify(ev.content)), {
            contentType: 'application/json',
            contentEncoding: 'utf-8',
            headers: { 'hostname': this.worker.state.hostname }
          });
        })
      })
      .then(() => {
        this.worker.on('module.pidbox.publish', ev => {
          const ticket  = ev.ticket;
          const method  = ev.method;
          const message = ev.message;

          const toSend = {
            reply_to: {
              routing_key: this.config('reply.queue.routingKey'),
              exchange: this.config('reply.exchange.name'),
            },
            ticket: _.isString(ticket) ? ticket : ticket.id,
            destination: null,
            method: method,
            arguments: {
              revoked: {},
              from_node: this.worker.state.hostname
            }
          };

          ch.publish(this.config('pidbox.exchange.name'), '', new Buffer(JSON.stringify(toSend)), {
            contentType: 'application/json',
            contentEncoding: 'utf-8',
            headers: { 'hostname': this.worker.state.hostname }
          });
        })
      })
  }
}

module.exports = Pidbox;

//
//
//const debug = require('debug')('pidbox');
//const uuid  = require('uuid');
//const _     = require('lodash');
//const Timeout = require('./Timeouts');
//
//class PidBox {
//
//  constructor(worker, options = {}) {
//    this.timeout = new Timeouts();
//
//    this.hostname    = hostname;
//    this.hellos      = {};
//    this.worker.channel     = channel;
//    this._routingKey = options.routingKey || uuid.v4();
//
//    this._hello = options.hello || {
//        'timeout': 2000,
//        'throw': true,
//      };
//
//    this._replyPidbox = options.reply || {
//        name: 'reply.celery.pidbox',
//        type: 'direct',
//        options: {
//          exclusive: false,
//          autoDelete: false,
//          durable: false
//        }
//      };
//
//    this._pidbox = options.pidbox || {
//        name: 'celery.pidbox',
//        type: null,
//        options: {}
//      };
//
//    this._workerReply = options || {
//        name: `${this._routingKey}.${this._replyPidbox.name}`,
//        type: null,
//        bind: this._replyPidbox.name,
//        options: {
//          durable: false,
//          autoDelete: true,
//          arguments: {
//            'x-message-ttl': 300000,
//            'x-expires': 10000,
//          }
//        }
//      };
//  }
//
//  listeners() {
//    this.worker.on('pidbox.reply.hello', msg => this.clearTimeout(msg.ticket));
//  }
//
//  sayHello() {
//    const ticket = uuid.v4();
//    return this
//      .channel
//      .publish(this._pidbox.name, {
//        "reply_to": {
//          "routing_key": this._routingKey,
//          "exchange": this._replyPidbox.name
//        },
//        "ticket": ticket,
//        "destination": null,
//        "method": "hello",
//        "arguments": {
//          "revoked": {},
//          "from_node": this.hostname
//        }
//      })
//      .then(() => {
//        this.hellos[ticket] = setTimeout(() => {
//          debug('Pas de réponse du serveur');
//          if(this._hello.exit) {
//            process.exit(1);
//          }
//        }, this._hello.timeout);
//      })
//  }
//
//  consumeReply() {
//    // j'ai un reply
//    // si c'est hello => cancel timeout hello
//    cancelTimeout(this.he)
//
//  }
//
//  start() {
//  .ExchangeUtils
//      .assertExchange(this._replyPidbox.name, this._replyPidbox.type, this._replyPidbox.options)
//      .then(() => QueueUtils.assertQueue(this._workerReply.name, this._workerReply.options))
//      .then(() => this.worker.channel.bindQueue(this._workerReply.name, this._replyPidbox.name, this._routingKey, this._workerReply.options))
//      .then(() => this.hello())
//  }
//
//  static _assertExchange() {
//    return.ExchangeUtils
//      .assertExchange(this.reply.name, this.reply.type, this.reply.options);
//  }
//
//  static _assertQueue() {
//    return.QueueUtils
//      .assertQueue(
//        this.queues.replyQueue,
//        {
//          exclusive: false,
//          autoDelete: true,
//          durable: false
//        }
//      );
//  }
//
//  static _bindQueue(key) {
//    return this
//      .channel
//      .bindQueue(
//        this.queues.replyQueue,
//        'reply.celery.pidbox',
//        key,
//        {
//          durable: false,
//          autoDelete: true,
//          arguments: {
//            'x-message-ttl': 300000,
//            'x-expires': 10000,
//          }
//        });
//  }
//}