module.exports = emitterMixin;

function emitterMixin(App) {
  Object.assign(App.prototype, {
    // middleware is a object like {handler, name}
    // handler can be a function return promise or async function
    use(handler, name) {
      const anonymousName = `anonymous${this._middlewares.length}`;
      let middleware = {};
      if (typeof handler === 'function') {
        middleware.handler = handler;
        middleware.name = name || handler.name || anonymousName;
      } else if (typeof handler === 'object' && typeof handler.handler === 'function') {
        middleware = handler;
        middleware.name = middleware.name
          || middleware.handler.name
          || anonymousName;
      } else {
        throw TypeError('app.use(handler, name) or app.use({handler, name}) handler must be a function');
      }
      this._middlewares.push(
        this.wrapMiddleware(middleware)
      );
      return this;
    },

    wrapMiddleware(middleware) {
      const {handler, name} = middleware;
      const {MIDDLEWARE_IN, MIDDLEWARE_OUT} = this.events;
      return (ctx, next) => {
        this._dev && this.emit(MIDDLEWARE_IN, name, ctx);
        return handler(ctx, next)
          .then((data) => {
            this._dev && this.emit(MIDDLEWARE_OUT, name, ctx);
            return data;
          }, (err) => {
            err.middleware = name;
            ctx.error = err;
            this._dev && this.emit(MIDDLEWARE_OUT, name, ctx);
            return Promise.reject(err);
          });
      };
    }
  });
}
