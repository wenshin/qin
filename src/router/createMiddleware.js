const compose = require('koa-compose');
const Router = require('./Router');
const {EVENTS} = require('../consts');
const App = require('../app');

const {NEW_ROUTER, SAME_ROUTER} = EVENTS;

Object.assign(App.context, {
  pickBreadcrumb(crumb) {
    const {location} = this;
    location.breadcrumbs = location.breadcrumbs || [];
    location.breadcrumbs.push(Object.assign({}, this.breadcrumb, crumb));
  }
});

/**
 * [createMiddleware description]
 * @param  {String}   options.path            [description]
 * @param  {Function} options.controller      [description]
 * @param  {Function} options.onLeave         [description]
 * @param  {Array}    options.routers         [description]
 * @param  {Function} options.getConfigAsync [description]
 * @return {Function}                         [description]
 */
function createMiddleware(options) {
  if (!options) {
    throw new TypeError('createMiddleware(options) options must be a non empty object');
  }
  const router = new Router(options);

  async function routerMiddware(ctx, next) {
    await processRouter(router, ctx);

    if (ctx.redirectTo) {
      ctx.location = ctx.redirectTo;
      ctx.redirectTo = null;
      await processRouter(router, ctx);
    }
    await next();
  }

  return {
    handler: routerMiddware,
    name: `router-entry:${options.path}`
  };
}

module.exports = createMiddleware;

function processRouter(router, ctx) {
  const {event, events, location} = ctx;
  const {NEW_LOCATION} = events;

  return router.match(ctx).then((matched) => {
    if (matched.match) {
      if (event.is(NEW_LOCATION)) {
        if (matched.router === location.router) {
          // 路由没有变化，添加 SAME_ROUTER 别名，
          // 这个事件说明没有变更路由 controller，但是更新了参数
          event.alias(SAME_ROUTER);
        } else {
          event.alias(NEW_ROUTER);
        }
      }

      location.params = matched.params;
      location.router = matched.router;
      return runControllers(matched.routers, ctx);
    }
    return matched;
  });
}

function runControllers(routers, ctx) {
  const {$app} = ctx;
  const middlewares = [];

  // 按顺序执行 promise，保证路由优先级顺序
  for (let i = 0; i < routers.length; i++) {
    const router = routers[i];
    const handler = (context, next) => {
      context.isPrefixMatch = i < routers.length - 1;
      context.breadcrumb = {
        pathname: router.pattern.cut(ctx.location.pathname),
        title: router.title
      };
      return router.controller(context, next);
    };
    const middleware = $app.dev ? $app.wrapMiddleware({
      name: `router:${router.path}`,
      handler,
    }) : handler;
    middlewares.push(middleware);
  }
  return compose(middlewares)(ctx);
}
