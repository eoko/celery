const Ticket = require('./Ticket');
const debug  = require('debug')('ticketManager');
const _      = require('lodash');

class TicketManager {

  constructor() {
    /** @private */
    this._tickets = {}
  }

  addTicket(ttl = 300, description = 'no description', reject) {
    const handler = (ticket) => this.endTicket(ticket);

    const ticket             = new Ticket(ttl, description, handler);
    this._tickets[ticket.id] = ticket;
    return ticket;
  }

  endTicket(ticket) {
    debug('Ticket "%s" removed from the ticket manager', ticket.id);
    delete this._tickets[ticket.id];
  }
}

module.exports = TicketManager;