module.exports = function mixin(koaApp) {
  const oldUse = koaApp.use;
  koaApp.use = function use(middleware) {
    let koaMiddleware = middleware;
    if (middleware && middleware.handler) {
      koaMiddleware = middleware.handler;
    }
    oldUse.call(this, koaMiddleware);
  };
};
