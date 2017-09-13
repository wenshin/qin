const assert = require('assert');
const {Router} = require('src/router');

describe('Router', () => {
  it('sync router', function(done) {
    const routerConfig = {
      title: '首页',
      path: '/',
      controller() {
        return '/';
      },
      routers: [{
        title: '用户',
        path: '/user',
        controller() {
          return '/user';
        },
        routers: [{
          title: '登录',
          path: '/user/login',
          controller() {
            return '/user/login';
          }
        }, {
          title: '登出',
          path: '/user/logout',
          controller() {
            return '/user/logout';
          }
        }]
      }]
    };
    const router = new Router(routerConfig);
    router.match('/user/login')
      .then((matched) => {
        const routerMatched = matched.router;
        const routerExcept = routerConfig.routers[0].routers[0];
        assert.equal(routerMatched.path, routerExcept.path);
        assert.equal(matched.routers.length, 3);
        assert.equal(matched.routers[0].path, routerConfig.path);
        assert.equal(matched.routers[1].path, routerConfig.routers[0].path);
        assert.equal(matched.routers[2].path, routerConfig.routers[0].routers[0].path);
        return routerMatched.getPropertyAsync('controller')
          .then(controller => {
            assert.equal(controller, routerExcept.controller);
            done();
          });
      })
      .catch(done);
  });

  it('async load router', function (done) {
    const userRouterConfig = {
      title: '用户',
      controller() {
        return '/user'
      },
      routers: [{
        title: '登录',
        path: '/user/login',
        controller() {
          return '/user/login';
        }
      }, {
        title: '登出',
        path: '/user/logout',
        controller() {
          return '/user/logout';
        }
      }]
    };
    const routerConfig = {
      title: '首页',
      path: '/',
      controller() {
        return '/';
      },
      routers: [{
        path: '/user',
        getAsyncConfig() {
          return Promise.resolve(userRouterConfig);
        }
      }]
    };
    const router = new Router(routerConfig);
    router.match('/user/logout')
      .then((matched) => {
        const routerMatched = matched.router;
        const routerExcept = userRouterConfig.routers[1];
        assert.equal(routerMatched.path, routerExcept.path);
        assert.equal(matched.routers.length, 3);
        return routerMatched.getPropertyAsync('controller')
          .then(controller => {
            assert.equal(controller, routerExcept.controller);
            done();
          });
      })
      .catch(done);
  });
});
