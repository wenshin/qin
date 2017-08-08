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
          return context;
        }).catch((err) => {
          context.error = err;
          event.reject(err);

          // if event.abort() called and emit context event error,
          // do not trigger context event
          if (!(err.name !== exception.EVENT_ABORT)
            && !(err.name !== exception.CONTEXT_EMIT)
          ) {
            try {
              this.emitContext(context);
            } catch (emitContextErr) {
              this.emit('error', emitContextErr);
            }
          }

          this.emit('error', err);
          // return a resolve result, so will not trigger Uncaught Error (in promise)
          return context;
        });
    },

    emitContext(context) {
      try {
        emitContext(context);
      } catch (err) {
        err.context = context;
        throw exception.createContextEmitException(err);
      }
    }
  });
}

function emitContext(ctx) {
  const {event, app} = ctx;
  if (event.name !== app.events.INIT && !app._initialized) return;

  if (event.status === 'pending') {
    event.pendingDelay(
      () => {
        app.emit('context', ctx);
        event.each(name => app.emit(`context:${name}`, ctx));
      },
      app._pendingDelay
    );
  } else {
    ctx.oldLocation = app.location;
    app.location = ctx.location;

    event.clearPending();
    // emit the named event first, cause of the context event always use to mount page,
    // so the named event will not triggered after page mounted immediately
    event.each(name => app.emit(`context:${name}`, ctx));

    // emit all event
    app.emit('context', ctx);
  }
}
