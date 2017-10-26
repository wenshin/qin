const {EVENTS} = require('../consts');

const disableMethods = ['dispatch', 'listen', 'unlisten', 'on', 'emit', 'off', 'removeListener'];

module.exports = App;

/**
 * the same api with qin app, used in server side
 */
function App({state, methods, location, events}) {
  this.state = state || {};
  this.methods = methods || {};
  this.location = location || {};
  this.events = Object.assign({}, EVENTS, events);

  for (const method of disableMethods) {
    this[method] = () => throwError(method);
  }
}

App.prototype.wrapMiddleware = function wrapMiddleware(middleware) {
  return middleware.handler;
};

function throwError(method) {
  throw new Error(`[Qin Server Render]you should not use '${method}' method in server render`);
}
