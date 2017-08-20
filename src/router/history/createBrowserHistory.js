const H5History = require('./H5History');
const HashHistory = require('./HashHistory');

function createBrowserHistory(emitter) {
  if (H5History.isSupport()) {
    return new H5History({emitter});
  }
  return new HashHistory({emitter});
}

module.exports = createBrowserHistory;
