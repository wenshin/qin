function register(event, handler) {
  if (event in register.eventsByName) {
    throw new Error(`event ${event} has existed`);
  }
  register.eventsByName[event] = handler;
}

register.eventsByName = {};
register.createEventRouter = createEventRouter;

module.exports = register;

function createEventRouter(eventConfigs) {
  function registerEvent(configArg) {
    const configs = [].concat(configArg);
    Array.prototype.map.call(configs, (config) => {
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

  async function eventRouter(ctx, next) {
    const {app, event} = ctx;
    const configs = [];
    const promises = [];

    event.nameSet.forEach((name) => {
      const eventConfig = register.eventsByName[name];
      if (eventConfig) {
        if (eventConfig.getAsyncConfig) {
          const promise = eventConfig
            .getAsyncConfig()
            .then((config) => {
              eventConfig.getAsyncConfig = null;
              eventConfig.handler = config.handler;
              configs.push(eventConfig);
            });
          promises.push(promise);
        } else {
          configs.push(eventConfig);
        }
      }
    });

    if (promises.length) {
      await Promise.all(promises);
    }

    const runEvent = conf => app.wrapMiddleware({
      name: `event:${conf.name}`,
      handler: conf.handler
    })(ctx);

    if (configs.length) {
      await Promise.all(configs.map(runEvent));
    }

    await next();
  }

  return {
    handler: eventRouter,
    name: 'event-router-entry'
  };
}
