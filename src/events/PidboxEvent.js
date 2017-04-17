class PidboxEvent {

  constructor(ticket, method = null, message = {}) {
    this._ticket  = ticket;
    this._method  = method;
    this._message = message;
  }

  get ticket() {
    return this._ticket;
  }

  get method() {
    return this._method;
  }

  get message() {
    return this._message;
  }
}

module.exports = PidboxEvent;