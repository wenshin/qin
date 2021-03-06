const util = require('./util');
const Event = require('./Event');
const Location = require('./Location');
const exception = require('./exception');
const App = require('./app');

const qin = {};

function createApp(...args) {
  return new App(...args);
}

qin.util = util;
qin.App = App;
qin.Event = Event;
qin.Location = Location;

qin.exception = exception;
qin.createApp = createApp;
qin.createLocation = Location.create;

module.exports = qin;
