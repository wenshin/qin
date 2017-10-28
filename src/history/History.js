const Location = require('../Location');

class History {
  /**
   * @param {*}       options
   * @param {Emitter} options.emitter    a object implement Node EventEmitter api
   */
  constructor(options = {}) {
    if (!options.emitter) throw TypeError('History.constructor(options) options.emitter is required');
    this._emitter = options.emitter;
    this._cur = 0;
    this._stack = [];
    this._maxStack = options.maxStack || 10;
    this._jsNavigation = false;
  }

  get location() {
    return this._stack[this._cur];
  }

  set location(options) {
    return this.setLocation(options);
  }

  get length() {
    return this._stack.length;
  }

  emit(event, ...args) {
    return this._emitter.emit(event, ...args);
  }

  on(event, handler) {
    return this._emitter.on(event, handler);
  }

  setLocation(options, idx) {
    this._cur = idx === undefined ? this._cur : (idx || 0);
    this._stack[this._cur] = Location.create(options);
    return this._stack[this._cur];
  }

  go(delta) {
    if (!delta) return null;
    const target = this.cur + delta;
    const location = this._stack[target];
    if (location) {
      this._cur = target;
      this._jsNavigation = true;
    }
    this._go(delta);
    return location;
  }

  _go() {
    return this;
  }

  forward() {
    return this.go(1);
  }

  back() {
    return this.go(-1);
  }

  replace(location) {
    if (this.isCrossDomain(location)) {
      throw new Error('cross domain location is not allowed');
    }
    this._stack[this._cur] = location;
    this._replace(location);
    return location;
  }

  _replace() {
    return this;
  }

  push(location) {
    if (this.isCrossDomain(location)) {
      throw new Error('cross domain location is not allowed');
    }
    const idx = this._stack.findIndex(l => l && l.path === location.path);

    if (idx === this._cur) {
      this._stack[this._cur] = location;
    } else if (idx < this._cur) {
      // push new location
      // delete all location after current location
      this._stack.splice(this._cur + 1, this._stack.length - this._cur - 1);
      if (this._stack.length === this._maxStack) {
        this._stack.shift();
      }
      this._stack.push(location);
      this._cur = this._stack.length - 1;
    } else {
      // delete the location between current location and target exist location
      // and replace the target location, this is like chrome history pushState
      this._stack.splice(this._cur + 1, idx - this._cur - 1);
      this._cur = this._cur + 1;
      this._stack[this._cur] = location;
    }
    this._push(location);
    return location;
  }

  _push() {
    return this;
  }

  isCrossDomain(location) {
    return location.host && this.location.host && location.host !== this.location.host;
  }
}

module.exports = History;
