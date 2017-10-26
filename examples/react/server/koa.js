const Koa = require('koa');
const fs = require('fs');
const React = require('react');
const { renderToString } = require('react-dom/server');
const qinContext = require('qin/koa/context');
const router = require('../router');
const eventRouter = require('../event-router');
const qinInit = require('../middlewares/init');

const app = new Koa();

if (!global.import) {
  global.import = path => Promise.resolve(require(path));
}

app.use(qinContext(app));
app.use(qinInit());
app.use(router.handler);
app.use(eventRouter.handler);
app.use((ctx) => {
  const {pageView, appState, state, location} = ctx;
  ctx.body = renderToString();
});

app.listen(3000);
