const compose = require('koa-compose');
const Event = require('../Event');
const exception = require('../exception');

module.exports = dispatchMixin;

function dispatchMixin(App) {
  Object.assign(App.prototype, {
    dispatch(name, data, options) {
      if (options && options.debounce) {
        return new Promise((resolve) => {
          const timer = this._debounceTimer[name];
          if (timer) {
            clearTimeout(timer);
          }
          this._debounceTimer[name] = setTimeout(() => {
            this._debounceTimer[name] = null;
            resolve(this._dispatch(name, data, options));
          }, options.debounce);
        });
      }
      return this._dispatch(name, data, options);
    },

    _dispatch(name, data, options) {
      const runMiddlewares = compose(this._middlewares);

      const event = new Event(name, data, this);
      const context = this.createContext(event);

      // if app not initialized, will set APP_INIT event to it,
      // so you can set set app.initialized = false to trigger any event to init data again.
      // it's useful when need reload permission or other cache data without reload page.
      if (!this.initialized) {
        event.alias(this.events.APP_INIT);
      }

      // 默认触发 pending 事件
      if (!options || options.pending !== false) {
        // for loading rendering
        event.pending();
        this.emitContext(context);
      }

      return runMiddlewares(context)
        .then(() => {
          event.fulfill();
          this.emitContext(context);
          if (event.is(this.events.APP_INIT)) {
            this.initialized = true;
          }
          return context;
        }, (err) => {
          // if event.abort() called
          // do not trigger context event
          if (err.name !== exception.EVENT_ABORT) {
            event.reject(err);
            this.emitContext(context);
          }
          // return a resolve result, so will not trigger Uncaught Error (in promise)
          return context;
        }).catch((err) => {
          // catch all error may trigger by emitContext or others unknown errors
          event.reject(err);
          this.emitContext(context);
          return err.context;
        });
    },

    emitContext(context) {
      try {
        emitContext(context);
      } catch (err) {
        throw exception.createContextEmitException(err);
      }
    }
  });
}

function emitContext(ctx) {
  const {event, events, $app} = ctx;
  if (!event.is(events.APP_INIT) && !$app.initialized) return;

  if (event.status === 'pending') {
    event.pendingDelay(emit, $app._pendingDelay);
  } else {
    event.clearPending();
    emit();
  }

  function emit() {
    // emit the named event first, cause of the context event always use to mount page,
    // so the named event will not triggered after page mounted immediately
    event.each(name => $app.emit(`context:${name}`, ctx));

    // emit all event
    $app.emit('context', ctx);
  }
}
