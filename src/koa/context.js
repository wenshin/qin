const App = require('./App');
const Event = require('../Event');
const Location = require('../Location');
const contextMixin = require('../app/context');
const {EVENTS} = require('../history/consts');

const {NEW_LOCATION} = EVENTS;

function createMiddleware(koaApp) {
  Object.assign(koaApp.context, contextMixin.contextProto);

  return function qinContext(ctx, next) {
    ctx.event = new Event(NEW_LOCATION);
    ctx.location = new Location({
      query: ctx.query,
      pathname: ctx.path,
      host: ctx.host,
    });
    ctx.$app = new App({
      location: ctx.location,
    });
    return next();
  };
}

module.exports = createMiddleware;
