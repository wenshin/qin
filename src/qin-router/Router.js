const PathPattern = require('./PathPattern');

class Router {
  constructor({title, path, routers, getAsyncRouters, controller, onLeave}) {
    if (title && typeof title !== 'string') {
      throw new TypeError('Router.constructor({title}) title must be a string');
    }

    if (!path || typeof path !== 'string') {
      throw new TypeError('Router.constructor({path}) path must be a string');
    }

    if (controller && typeof controller !== 'function') {
      throw new TypeError('Router.constructor({controller}) controller must be a function');
    }

    if (onLeave && typeof onLeave !== 'function') {
      throw new TypeError('Router.constructor({onLeave}) onLeave must be a function');
    }

    if (getAsyncRouters && typeof getAsyncRouters !== 'function') {
      throw new TypeError('Router.constructor({getAsyncRouters}) getAsyncRouters must be a function');
    }

    this.title = title;
    this.path = path;
    this.pattern = new PathPattern(path);
    this.routers = null;
    this.routerConfigs = routers ? [].concat(routers) : [];
    this.getAsyncRouters = getAsyncRouters;
    this.controller = controller;
    this.onLeave = onLeave;
    this.hasSubRouters = !!(routers || getAsyncRouters);
    this.matchCache = {};
  }

  async match(ctx) {
    const {pathname} = ctx.location;
    let matched = this.matchCache[pathname];
    if (matched) return matched;

    if (!this.hasSubRouters) {
      matched = this.pattern.match(pathname);
    } else {
      if (!this.routers) {
        await this.initRouters();
      }
      const matchPrefix = true;
      matched = this.pattern.match(pathname, matchPrefix);
      if (matched.match && (matched.prefix || !this.controller)) {
        matched = await this.matchSubRouters(ctx);
      }
    }

    if (matched.match) {
      matched.router = matched.router || this;
      matched.routers = matched.routers || [];
      this.controller && matched.routers.unshift(this);
    }

    this.matchCache[pathname] = matched;
    return matched;
  }

  async initRouters() {
    let configs = this.routerConfigs;
    if (this.getAsyncRouters) {
      const config = await this.getAsyncRouters();
      if (config) {
        configs = configs.concat(config);
      } else {
        throw new TypeError('Router.constructor(options) options.getAsyncRouters must be a function return promise which resolves configs');
      }
    }
    this.routers = createRouters(this.path, configs);
  }

  matchSubRouters(ctx) {
    let promise;
    function fulfilled(router) {
      return (matched) => {
        if (matched.match) {
          return matched;
        }
        return router.match(ctx);
      };
    }

    // 按顺序执行 promise，保证路由优先级顺序
    for (let i = 0; i < this.routers.length; i++) {
      const router = this.routers[i];
      promise = promise
        ? promise.then(fulfilled(router))
        : router.match(ctx);
    }
    return promise;
  }
}

function createRouters(path, configs) {
  const routers = [];
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    let newPath = path + config.path;
    newPath = newPath.replace(/\/{2,}/g, '/');
    const router = new Router(Object.assign({}, config, {path: newPath}));
    routers.push(router);
  }
  return routers;
}

module.exports = Router;
