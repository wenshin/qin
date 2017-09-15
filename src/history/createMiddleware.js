const createBrowserHistory = require('./createBrowserHistory');
const Location = require('../Location');
const {EVENTS} = require('../consts');

const {NEW_LOCATION, SAME_LOCATION} = EVENTS;

// os, app, container, device, location
function createMiddleware(app, historyArg) {
  const history = historyArg || createBrowserHistory(app._emitter);

  history.on('location', (location) => {
    dispatchLocation(app, 'replace', location);
  });

  extendsApp(app, history);

  return function historyMiddleware(ctx, next) {
    const {event} = ctx;

    let historyAction;
    if (event.is(NEW_LOCATION)) {
      historyAction = event.data;
    } else {
      // every event except NEW_LOCATION will replace the history.
      historyAction = {
        location: history.location,
        type: 'replace',
      };

      if (event.is(app.events.INIT)) {
        // when app is really changed a location, trigger this event
        // this is useful for navigation links to auto change active status
        // eg. see ./vue-plugin/Link
        event.alias(NEW_LOCATION);
      } else {
        event.alias(SAME_LOCATION);
      }
    }

    ctx.historyAction = historyAction;
    ctx.location = historyAction.location;

    return next().then(() => {
      if (ctx.historyAction && ctx.historyAction.location) {
        const {type, location} = ctx.historyAction;
        app.history[type](location);
      }
    });
  };
}

module.exports = createMiddleware;

function extendsApp(app, history) {
  Object.assign(app, {
    history,
    push(path, query) {
      // options is same to `options` of Location.constructor(options).
      const options = argsToOptions(path, query);

      function dispatch() {
        return dispatchLocation(app, 'push', options);
      }

      if (app.location.router && app.location.router.onLeave) {
        const promise = app.location.router.onLeave(app.location);
        if (promise && promise.then && promise.catch) {
          return promise
            .then(() => dispatch())
            .catch((err) => {
              app.emit('error', err);
              return Promise.reject(err);
            });
        } else if (promise) {
          return dispatch();
        }
      }
      return dispatch();
    },

    replace(path, query) {
      const options = argsToOptions(path, query);
      return dispatchLocation(app, 'replace', options);
    },

    back() {
      this.history.back();
    },

    forward() {
      this.history.forward();
    },

    go(delta) {
      this.history.go(delta);
    }
  });

  Object.assign(app.events, {
    NEW_LOCATION,
    SAME_LOCATION
  });

  Object.assign(app.constructor.context, {
    redirect(locationOptions) {
      this.redirectTo = Location.create(locationOptions);
      this.event.alias(NEW_LOCATION);
      this.historyAction = {
        type: 'push',
        location: this.redirectTo
      };
    }
  });
}

function dispatchLocation(app, type, locationOptions) {
  return app.dispatch(NEW_LOCATION, {
    type,
    location: Location.create(locationOptions)
  });
}

function argsToOptions(path, query) {
  let options;
  if (typeof path === 'object') {
    options = path;
  } else if (typeof path === 'string') {
    options = {path, query};
  } else {
    throw new TypeError('app.push(path, query) or app.push(options) path or options is needed');
  }
  return options;
}
