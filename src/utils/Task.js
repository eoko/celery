class Task {

  constructor(taskObj) {
    this.script             = taskObj.script;
    this.name               = taskObj.name;
    this.exec_mode          = taskObj.exec_mode;
    this.instance           = taskObj.instance;
    this.max_memory_restart = taskObj.max_memory_restart;
    this._ids               = [];
  }

  addId(id) {
    return this._ids.push(id);
  }

  RemoveId(id) {
    delete this._ids[id];
  }
}

module.exports = Task;