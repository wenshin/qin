const util = require('../util');

module.exports = initMixin;

const INIT = '$bux.init';
const MIDDLEWARE_IN = '$bux.middleware.in';
const MIDDLEWARE_OUT = '$bux.middleware.out';

function initMixin(App) {
  Object.assign(App.prototype, {
    _initInstance(options) {
      // if dev mode will not emit some verbose events, like middleware stack
      this._dev = options.dev;
      this._emitter = options.emitter;
      this._middlewares = [];
      this._initialized = false;
      this.__bux = true;

      // location is empty before init event
      this.location = options.location || this.initLocation();
      // always save global data, like user info, permissions
      this.state = options.state || {};
      // some methos for state
      this.methods = options.methods || {};

      // event constants
      this.events = Object.assign({
        INIT,
        MIDDLEWARE_IN,
        MIDDLEWARE_OUT
      }, options.events);

      this._debounceTimer = {};

      // default pending render delay 500 ms.
      // there is no need to show loading when loading is so fast
      this._pendingDelay = typeof options.pendingDelay === 'number'
        ? options.pendingDelay
        : 500;
    },

    init() {
      return this
        .dispatch(INIT)
        .then(() => (this._initialized = true));
    },

    initLocation() {
      // 必须用 Object.assign 复制一份 location
      // 浏览器的 location 重新给 href 复制会刷新页面
      const location = Object.assign({}, util.location);
      location.href = decodeURIComponent(location.href);
      location.search = decodeURIComponent(location.search);
      location.query = util.parseQuery(location.search);
      location.path = location.pathname + location.search;
      location.state = {};
      return location;
    }
  });
}
