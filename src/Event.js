const exception = require('./exception');

class Event {
  static isId(eventId) {
    return /^eid-\d{3}-\d{6}$/.test(eventId);
  }

  static newId() {
    return `eid-${String(Date.now()).slice(-3)}-${String(Math.random()).slice(2, 8)}`;
  }

  constructor(name, data) {
    this.id = Event.newId();
    this.name = name;
    this.nameSet = new Set([name]);
    this.data = data;
    this.status = 'pending';
    this.errors = [];
    this._pendingTimer = null;
  }

  pending() {
    this.status = 'pending';
  }

  pendingDelay(fn, delay) {
    if (this._pendingTimer) fn();

    this._pendingTimer = setTimeout(() => {
      this._pendingTimer = null;
      fn();
    }, delay);
  }

  clearPending() {
    this._pendingTimer && clearTimeout(this._pendingTimer);
    this._pendingTimer = null;
  }

  fulfill() {
    this.status = 'fulfilled';
  }

  reject(error) {
    this.errors.push(error);
    this.status = 'rejected';
  }

  abort(msg) {
    this.status = 'aborted';
    const msgstr = msg ? `(${msg})` : '';
    throw exception.createEventAbortException(`event ${this.name} aborted.${msgstr}`);
  }

  is(arr) {
    const finder = name => this.nameSet.has(name);
    return [].concat(arr).find(finder);
  }

  each(cb) {
    this.nameSet.forEach(name => cb(name));
  }

  alias(name, data) {
    this.nameSet.add(name);
    if (typeof data === 'object' && typeof this.data === 'object') {
      Object.assign(this.data, data);
    } else if (data) {
      this.data = data;
    }
  }
}

module.exports = Event;
