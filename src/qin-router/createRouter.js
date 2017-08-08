const compose = require('koa-compose');
const Router = require('./Router');

const NEW_ROUTER = '$qin-router.router.new';
const SAME_ROUTER = '$qin-router.router.same';

/**
 * [createRouter description]
 * @param  {[type]} options.path         [description]
 * @param  {[type]} options.controller      [description]
 * @param  {[type]} options.onLeave      [description]
 * @param  {[type]} options.routers         [description]
 * @param  {[type]} options.getAsyncRouters [description]
 * @return {[type]}                         [description]
 */
function createRouter(app, options) {
  if (!options) {
    throw new TypeError('createRouter(options) options must be a non empty object');
  }
  const router = new Router(options);

  extendsApp(app);

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

module.exports = createRouter;

function processRouter(router, ctx) {
  const {event, app, location} = ctx;
  const {NEW_LOCATION} = app.events;

  return router.match(ctx).then((matched) => {
    if (matched.match) {
      if (event.is(NEW_LOCATION)) {
        if (matched.router === app.location.router) {
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
  const {app} = ctx;
  const middlewares = [];

  // 按顺序执行 promise，保证路由优先级顺序
  for (let i = 0; i < routers.length; i++) {
    const router = routers[i];
    middlewares.push(app.wrapMiddleware({
      name: `router:${router.path}`,
      handler(context, next) {
        context.isPrefixMatch = i < routers.length - 1;
        context.breadcrumb = {
          pathname: router.pattern.cut(ctx.location.pathname),
          title: router.title
        };
        return router.controller(context, next);
      }
    }));
  }
  return compose(middlewares)(ctx);
}

function extendsApp(app) {
  Object.assign(app.events, {
    NEW_ROUTER,
    SAME_ROUTER
  });

  Object.assign(app.constructor.context, {
    pickBreadcrumb(crumb) {
      const {location} = this;
      location.breadcrumbs = location.breadcrumbs || [];
      location.breadcrumbs.push(Object.assign({}, this.breadcrumb, crumb));
    }
  });
}
