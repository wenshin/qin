import 'babel-polyfill';
import Emitter from 'events';
import qin from 'qin';
import qinRouter from 'qin/router';
import qinEventRouter from 'qin/event-router';
import qinHistory from 'qin/history';
import router from '../qin/router';
import eventRouter from '../qin/event-router';
import init from '../qin/init';
import render from '../qin/render';
import logger from '../qin/logger';

const app = qin.createApp({
  emitter: new Emitter()
});

app.listen(render);
app.listen(render);

app.use(qinHistory.createMiddleware());
app.use(qinRouter(router));
app.use(qinEventRouter(eventRouter));
app.use(init);
app.init();
