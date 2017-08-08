module.exports = emitterMixin;

// this._emitter use EventEmitter style API by default.
function emitterMixin(App) {
  Object.assign(App.prototype, {
    on(event, handler) {
      return this._emitter.on(event, handler);
    },

    once(event, handler) {
      return this._emitter.once(event, handler);
    },

    emit(event, ...args) {
      return this._emitter.emit(event, ...args);
    },

    off(event, handler) {
      const method = this._emitter.off || this._emitter.removeListener;
      return method(event, handler);
    },

    removeListener(event, handler) {
      return this.off(event, handler);
    }
  });
}
