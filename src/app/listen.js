module.exports = listenMixin;

function listenMixin(App) {
  Object.assign(App.prototype, {
    /**
     * add 'context' event handlers
     * @param  {Function} cb
     * @param  {String}   eventName Optional
     * @param  {Function}           then bind function
     */
    listen(eventName, cb) {
      this._listen(eventName, cb, 'on');
    },

    listenOnce(eventName, cb) {
      this._listen(eventName, cb, 'once');
    },

    _listen(eventName, cb, method) {
      const args = {eventName, cb};
      if (typeof eventName === 'function') {
        args.cb = eventName;
        args.eventName = '';
      }
      assertListen(args.cb, args.eventName, 'listen');
      this[method](args.eventName ? `context:${args.eventName}` : 'context', args.cb);
    },

    unlisten(eventName, cb) {
      const args = {eventName, cb};
      if (typeof eventName === 'function') {
        args.cb = eventName;
        args.eventName = '';
      }
      assertListen(args.cb, args.eventName, 'unlisten');
      this.off(args.eventName ? `context:${args.eventName}` : 'context', args.cb);
    }
  });
}

function assertListen(cb, eventName, method) {
  if (typeof cb !== 'function') {
    throw new TypeError(`Application.${method}(cb, eventName) cb must be a function`);
  }
  if (eventName && typeof eventName !== 'string') {
    throw new TypeError(`Application.${method}(cb, eventName) eventName must be a string`);
  }
}
