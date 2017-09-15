const {EVENTS} = require('../consts');
const util = require('../util');
const Location = require('../Location');

module.exports = initMixin;

function initMixin(App) {
  Object.assign(App.prototype, {
    _initInstance(options) {
      // if dev mode will not emit some verbose events, like middleware stack
      this.dev = options.dev;
      this._emitter = options.emitter;
      this._middlewares = [];
      this._initialized = false;
      this.__bux = true;

      this.location =  new Location(options.location || util.location);
      // always save global data, like user info, permissions
      this.state = options.state || {};
      // some methods for state
      this.methods = options.methods || {};

      // event constants
      this.events = Object.assign({}, EVENTS, options.events);

      this._debounceTimer = {};

      // default pending render delay 500 ms.
      // there is no need to show loading when loading is so fast
      this._pendingDelay = typeof options.pendingDelay === 'number'
        ? options.pendingDelay
        : 500;
    },

    init() {
      return this
        .dispatch(APP_INIT)
        .then(() => (this._initialized = true));
    }
  });
}
