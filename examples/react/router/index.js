const {createMiddleware} = require('qin/router');

module.exports = createMiddleware({
  path: '/',
  title: '首页',
  controller(ctx, next) {
    if (ctx.isPrefixMatch) return next();
    return null;
  },
  routers: [
    {
      path: '/todos',
      title: '待办事项',
      controller(ctx, next) {
        return import('../client/todo/app')
          .then((Todo) => {
            if (ctx.isPrefixMatch) return next();
            ctx.view = Todo;
            return null;
          });
      }
    }
  ]
});
