const uuid  = require('uuid');
const debug = require('debug')('ticket');

class Ticket {

  constructor(ttl = 300, description = 'no description', timeoutHandler) {
    this.id          = uuid.v4();
    this.description = description;
    this.timestamp   = +new Date();
    this.ttl         = ttl;
    this.timeout     = this.timestamp + ttl;

    const th         = timeoutHandler || ((ticket) => {
        debug('No response for ticket "%s"', ticket.id);
      });

    this.timeoutId   = setTimeout(() => this.fulfill(th), ttl);
  }

  /**
   * Fulfill ticket and cancel timeout.
   * @returns {Ticket}
   */
  fulfill(timeoutHandler) {
    timeoutHandler(this);
    clearTimeout(this.timeoutId);
    return this;
  }

}

module.exports = Ticket;