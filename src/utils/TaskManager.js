const os    = require('os');
const uuid  = require('uuid');
const pm2   = require('pm2');
const debug = require('debug')('worker:task');
const _     = require('lodash');

class TaskManager {

  constructor(worker) {
    this.worker       = worker;
    this.tasks = {};

    pm2.connect((err) => {
      if (err) {
        console.error(err);
        process.exit(2);
      }
    });
  }

  _sendMessage(name, data, topic = 'process:msg') {
    const id = `${this.worker.tasks[name][Math.floor(Math.random() * this.tasks[name].length)].pm_id}`;
    pm2.sendDataToProcessId(
      id,
      { topic, data },
      function (err, res) {
        debug(err, res);
      });
  }

  start() {
    // clean
    const scripts = this.getTasks();

    pm2.start(scripts, (err) => {
      pm2.list((err, apps) => {
        if (err) throw err;
        apps.forEach(script => {
          if(this.tasks[script.name]) {
            this.tasks[script.name].addId(script.pm_id);
          }
        });
      });
      if (err) throw err
    });

    pm2.launchBus(function (err, bus) {
      bus.on('process:msg', function (packet) {
        debug(packet);
      });
    });
  }

  getTasks() {
    return _.map(this.tasks, task => {
      return task;
    })
  }

  removeTask(name) {

  }

  addTask(task) {
    this.tasks[task.name] = task;
  }
}

module.exports = TaskManager;