function register(event, handler) {
  if (event in register.eventsByName) {
    throw new Error(`event ${event} has existed`);
  }
  register.eventsByName[event] = handler;
}

register.eventsByName = {};
register.createMiddleware = createMiddleware;

module.exports = register;

function createMiddleware(eventConfigs) {
  function registerEvent(configArg) {
    const configs = [].concat(configArg);
    configs.map((config) => {
      if (config && config.length) {
        registerEvent(config);
      } else {
        register(config.name, config);
      }
    });
  }
  if (eventConfigs && eventConfigs.length) {
    registerEvent(eventConfigs);
  }

  function eventRouter(ctx, next) {
    const {$app, event} = ctx;
    const promises = [];

    const runEvent = conf => $app.wrapMiddleware({
      name: `event:${conf.name}`,
      handler: conf.handler
    })(ctx);

    event.nameSet.forEach((name) => {
      const eventConfig = register.eventsByName[name];
      if (eventConfig) {
        if (eventConfig.getAsyncConfig) {
          const promise = eventConfig
            .getAsyncConfig()
            .then((config) => {
              eventConfig.getAsyncConfig = null;
              eventConfig.handler = config.handler;
              return runEvent(eventConfig);
            });
          promises.push(promise);
        } else {
          promises.push(eventConfig);
        }
      }
    });

    if (promises.length) {
      return Promise.all(promises).then(() => next());
    }
    return next();
  }

  return {
    handler: eventRouter,
    name: 'event-router-entry'
  };
}
