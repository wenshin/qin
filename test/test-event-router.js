const assert = require('assert');
const register = require('src/event-router');

describe('event router', () => {
  it('register sync events', () => {
    register({
      name: 'test-event',
      handler(ctx, next) {
        return next();
      }
    });
  });
});
