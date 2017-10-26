import 'babel-polyfill';
import qin from 'qin';
import router from '../router';
import eventRouter from 'qin/event-router';
import history from 'qin/history';
import Emitter from 'events';

const app = qin.createApp({
  emitter: new Emitter()
});

app.use(history);
app.use(router);
app.use(eventRouter);
app.init();

app.listen((ctx) => {

});

app.dispatch('my-event', {a: 1});
