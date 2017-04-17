const os   = require('os');
const uuid = require('uuid');

class State {

  constructor(worker) {
    this.ready       = false;
    this.swIdent     = 'kk';
    this.identity    = 'node-worker-celery';
    this.uuid        = uuid.v4();
    this.loadAverage = [0.01, 0.06, 0.01];
    this.active      = 0;
    this.system      = process.platform;
    this.version     = '4.0.2';
    this.hostname    = `celery@uniq_${os.hostname()}`;
    this.processed   = 0;
    this.allCount    = 0;
    this.totalCount  = 0;
    this.revoked     = 0;
    this.clock       = 6855;
    this.freq        = 2;
    this.pid         = 1;
    this.timestamp   = 1484420551.0294623;
    this.utcoffset   = 0;
    this.messageSent = 0;

    worker.on('worker.state.refresh', () => this.refresh());
    worker.on('worker.state.newMessageSent', () => this.newMessageSent());
  }

  newMessageSent() {
    this.messageSent++;
  }

  refresh() {
    return Promise.resolve(this);
  }

  toJson() {
    return {
      sw_ident: this.swIdent,
      loadavg: this.loadAverage,
      clock: this.clock,
      active: this.active,
      sw_sys: this.system,
      freq: this.freq,
      pid: this.pid,
      timestamp: this.timestamp,
      utcoffset: this.utcoffset,
      sw_ver: this.version,
      hostname: this.hostname,
      processed: this.processed,
      messageSent: this.messageSent,
    }
  }
}

module.exports = State;