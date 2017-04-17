//const pm2 = require('pm2');
const Consumer = require('./Consumer');
const _        = require('lodash');
const debug    = require('debug')('worker');

const os            = require('os');
const EventEmitter  = require('eventemitter2').EventEmitter2;
const ConfigManager = require('./utils/ConfigManager');
const TicketManager = require('./utils/TicketManager');
const State         = require('./State');
const Dispatcher    = require('./boosteps/Dispatcher');
const Heartbeat     = require('./modules/Heartbeat');
const WorkerQueue   = require('./boosteps/WorkerQueue');
const Presence      = require('./modules/Presence');
const Pidbox        = require('./modules/Pidbox');
const Hello         = require('./modules/Hello');
const Info          = require('./modules/Info');
const TaskManager   = require('./utils/TaskManager');

class Worker extends EventEmitter {

  constructor() {
    super({ wildcard: true });
    this.ticketManager = new TicketManager();
    this.configManager = new ConfigManager();
    this.taskManager   = new TaskManager(this);
    this.bootsteps     = [];
    this.modules       = [];
    this.state         = new State(this);

    this.config   = this.configManager.namespacedConfig('worker');
    this.hostname = this.config('name', 'workername');

    /** Dispatch event to all workers */
    this.bootstep(Dispatcher);
    //
    ///** Listen for reply and emit */
    //this.use(/** Reply */);
    //
    ///** Listen for reply that come from PidBox */
    //this.use(/** Pidbox Reply */);
    //
    ///** Listen for pidbox (remote control) */
    this.use(Pidbox);

    /** Bind on worker queue */
    this.bootstep(WorkerQueue);

    /** Notifiy presence to all workers */
    this.use(Presence);

    /** Say alive to all workers */
    this.use(Heartbeat);

    /** Say hello to all workers */
    this.use(Hello);

    /** Say hello to all workers */
    this.use(Info);

    /** Add listeners */

    //do something when app is closing
    process.on('exit', () => {
      this.emit('end');
    });

    //catches ctrl+c event
    process.on('SIGINT', () => {
      this.emit('exit');
      process.exit(0);
    });

    //catches uncaught exceptions
    process.on('uncaughtException', (err) => {
      this.emit('error', err);
      debug(err);
      process.exit(1);
    });
  }

  /**
   *
   * @param {Task} task
   */
  addTask(task) {
    this.taskManager.addTask(task);
  }

  /**
   *
   * @param {Task} name
   */
  removeTask(name) {
    this.taskManager.removeTask(name);
  }

  init() {
    const consumer = new Consumer(this);
    return consumer
      .start()
      .then(ch => {
        let promise = Promise.resolve();

        this.bootsteps.forEach(Bootstep => {

          debug('New boostep', Bootstep.name);
          const bootstep = new Bootstep(this);
          promise        = promise.then(() => {
            bootstep.start(ch)
          });
        });

        this.modules.forEach(module => {

          debug('New module "%s"', module.__proto__.constructor.name);
          if (_.isFunction(module.setListeners)) {
            debug('-');
            module.setListeners.bind(this, this.on);
          }
          if (_.isFunction(module.setEmitters)) module.setEmitters.bind(this, this.emit);
          if (_.isFunction(module.initialize)) {
            promise = promise.then(() => {
              return module.initialize(ch)
            });
          }
        });

        return promise;
      })
      .then(() => this.taskManager.start())
      .catch(err => {
        debug(err);
        this.emit('error');
      });
  }

  bootstep(Bootstep) {
    if (_.isFunction(Bootstep)) {
      this.bootsteps.push(Bootstep);
    } else {
      debug('Could not use >>', Bootstep)
    }
  }

  use(Module) {
    const inst      = new Module();
    const namespace = inst.name;
    this.configManager.merge(namespace, _.isFunction(inst.defaults) ? inst.defaults() : {});
    if (_.isFunction(inst.configure)) {
      inst.configure(this, this.configManager.namespacedConfig(namespace));
    }
    this.modules.push(inst);
  }
}

/**
 * @type {Worker}
 */
module.exports = Worker;