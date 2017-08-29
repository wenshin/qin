const util = require('./util');
const Event = require('./Event');
const exception = require('./exception');
const App = require('./app');

const qin = {};

function createApp(...args) {
  return new App(...args);
}

qin.util = util;
qin.App = App;
qin.Event = Event;

qin.exception = exception;
qin.createApp = createApp;
qin.createLocation = Location.create;

module.exports = qin;
