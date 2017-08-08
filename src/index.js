const util = require('./util');
const Event = require('./Event');
const exception = require('./exception');
const App = require('./app');

const qin = {};

function createApp(...args) {
  return (util.g.$app = new App(...args));
}

Object.defineProperty(util.g, '$app', {
  get() {
    // 在 Safari 10 中，window 上使用 defineProperty 时，
    // get 和 set 方法中不能使用 this，this 是 undefined。
    if (!util.g.$_app) {
      throw exception('please use global.$app after call qin.createApp()!');
    }
    return util.g.$_app;
  },
  set(app) {
    util.g.$_app = app;
  }
});

qin.util = util;
qin.App = App;
qin.Event = Event;

qin.exception = exception;
qin.createApp = createApp;
qin.createLocation = Location.create;

module.exports = qin;
