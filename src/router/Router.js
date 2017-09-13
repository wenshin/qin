const PathPattern = require('./PathPattern');

class Router {
  constructor({title, path, routers, getConfigAsync, controller, onLeave}) {
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

    if (getConfigAsync && typeof getConfigAsync !== 'function') {
      throw new TypeError('Router.constructor({getConfigAsync}) getConfigAsync must be a function');
    }

    this.title = title;
    this.path = path;
    this.pattern = new PathPattern(path);
    this.getConfigAsync = getConfigAsync;
    this.hasSubRouters = !!(routers || getConfigAsync);
    if (!getConfigAsync) {
      this.routers = routers ? createRouters(path, routers) : [];
      this.controller = controller;
      this.onLeave = onLeave;
    }
  }

  updateConfig({title, path, routers, controller, onLeave}) {
    title && (this.title = title);
    path && (this.path = path);
    routers && (this.routers = createRouters(this.path, routers));
    controller && (this.controller = controller);
    onLeave && (this.onLeave = onLeave);
  }

  getPropertyAsync(prop) {
    if (this[prop]) {
      return Promise.resolve(this[prop]);
    }
    if (this.getConfigAsync) {
      return this.getConfigAsync()
        .then((config) => {
          config && this.updateConfig(config);
          return this[prop];
        });
    }
    return Promise.resolve();
  }

  match(pathname) {
    let matched = Router.matchCache[pathname];
    if (matched) return Promise.resolve(matched);

    matched = this.pattern.match(pathname);
    if (matched.match) {
      // only cache no params router, when server side render params router will lose control memory
      if (!this.pattern.hasParams) {
        Router.matchCache[pathname] = matched;
      }
      matched.router = this;
      matched.routers = [this];
      return Promise.resolve(matched);
    }

    // prefix match
    matched = this.pattern.match(pathname, true);
    if (!matched.match) {
      return Promise.resolve({match: false});
    }

    return this.matchSubRoutersAsync(pathname);
  }

  matchSubRoutersAsync(pathname) {
    return this.getPropertyAsync('routers')
      .then((routers) => {
        let promise;
        // 按顺序执行 promise，保证路由优先级顺序
        for (let i = 0; i < routers.length; i++) {
          const router = routers[i];
          promise = promise
            ? promise.then((matched) => {
              if (matched.match) {
                return matched;
              }
              return router.match(pathname);
            })
            : router.match(pathname);
        }
        return promise;
      })
      .then((matched) => {
        if (matched.match) {
          this.controller && matched.routers.unshift(this);
          return matched;
        }
        return {match: false};
      });
  }
}

Router.matchCache = {};

function createRouters(path, configs) {
  const routers = [];
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    const isAbsolutePath = config.path.indexOf(path) === 0;
    let newPath;
    if (isAbsolutePath) {
      newPath = config.path;
    } else {
      newPath = (path + config.path).replace(/\/{2,}/g, '/');
    }
    const router = new Router(Object.assign({}, config, {path: newPath}));
    routers.push(router);
  }
  return routers;
}

module.exports = Router;
