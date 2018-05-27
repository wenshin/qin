const {EVENTS} = require('../consts');
const util = require('../util');
const Location = require('../Location');

module.exports = initMixin;

const APP_INIT = '_appinit';
const NEW_LOCATION = '_location.new';
const NEW_VIEW = '_view.new';
const MIDDLEWARE_IN = '_middleware.in';
const MIDDLEWARE_OUT = '_middleware.out';

function initMixin(App) {
  Object.assign(App.prototype, {
    _initInstance(options) {
      // if dev mode will not emit some verbose events, like middleware stack
      this.dev = options.dev;
      this.initialized = false;

      // always save global data, like user info, permissions
      this.state = options.state || {};
      // some methods for state
      this.methods = options.methods || {};

      // event constants
      this.events = Object.assign({
        APP_INIT,
        NEW_VIEW,
        NEW_LOCATION,
        MIDDLEWARE_IN,
        MIDDLEWARE_OUT
      }, options.events);

      this._emitter = options.emitter;
      this._middlewares = [];
      this._debounceTimer = {};

      // default pending render delay 500 ms.
      // there is no need to show loading when loading is so fast
      this._pendingDelay = typeof options.pendingDelay === 'number'
        ? options.pendingDelay
        : 500;

      Object.defineProperty(this, 'location', {
        writable: false,
        value: new Location(options.location || util.location)
      });
    },

    init() {
      return this.dispatch(EVENTS.APP_INIT);
    }
  });
}
