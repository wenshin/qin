const EventEmitter = require('events');
const assert = require('assert');
const App = require('src/app');

describe('App', () => {
  it('app init', (done) => {
    const app = new App({
      emitter: new EventEmitter()
    });

    // init
    app.use((ctx, next) => {
      const {shareState} = ctx;
      return next().then(() => {
        if (ctx.event.is(ctx.events.APP_INIT)) {
          shareState.bar = true;
        }
      });
    });

    app.use((ctx) => {
      if (ctx.event.is(ctx.events.APP_INIT)) {
        ctx.state.foo = true;
      }
    });

    app.listen((ctx) => {
      assert.ok(ctx.event.is(ctx.events.APP_INIT));
      assert.ok(ctx.isFulfilled);
      if (ctx.state.foo && ctx.shareState.bar) {
        done();
      } else {
        done('init failed');
      }
    });

    app.init();
  });

  it('app trigger pending event when pendingDelay is smaller than execution consume', (done) => {
    const app = new App({
      emitter: new EventEmitter(),
      pendingDelay: 5
    });

    // init
    app.use((ctx, next) => {
      const {shareState} = ctx;
      if (ctx.event.is(ctx.events.APP_INIT)) {
        shareState.bar = true;
      }
      const promise = new Promise((resolve) => {
        setTimeout(resolve, 10);
      });
      return promise.then(next);
    });

    let triggerPending = false;
    app.listen((ctx) => {
      assert.ok(ctx.event.is(ctx.events.APP_INIT));
      assert.ok(ctx.shareState.bar);
      if (ctx.isPending) {
        triggerPending = true;
      } else if (ctx.isFulfilled) {
        triggerPending ? done() : done(new Error('not trigger pending event'));
      } else {
        done(new Error('error'));
      }
    });

    app.init();
  });

  it('app abort trigger pending event when pendingDelay great than execution consume', (done) => {
    const app = new App({
      emitter: new EventEmitter(),
      pendingDelay: 10
    });

    // init
    app.use((ctx, next) => {
      const {shareState} = ctx;
      if (ctx.event.is(ctx.events.APP_INIT)) {
        shareState.bar = true;
      }
      const promise = new Promise((resolve) => {
        setTimeout(resolve, 5);
      });
      return promise.then(next);
    });

    let triggerPending = false;
    app.listen((ctx) => {
      assert.ok(ctx.event.is(ctx.events.APP_INIT));
      assert.ok(ctx.shareState.bar);
      if (ctx.isPending) {
        triggerPending = true;
      } else if (ctx.isFulfilled) {
        triggerPending ? done(new Error('should not trigger pending event')) : done();
      } else {
        done('error');
      }
    });

    app.init();
  });

  it('context.error', (done) => {
    const app = new App({
      emitter: new EventEmitter()
    });
    const err = new Error('test error');

    // init
    app.use(() => {
      throw err;
    });

    app.listen((ctx) => {
      assert.ok(ctx.event.is(ctx.events.APP_INIT));
      assert.ok(ctx.isRejected);
      if (ctx.error === err) {
        done();
      } else {
        done(new Error('context should have error'));
      }
    });

    app.init();
  });

  it('catch error in listen', (done) => {
    const app = new App({
      emitter: new EventEmitter()
    });
    const err = new Error('test error');

    let isFulfilled = false;
    app.listen((ctx) => {
      if (ctx.isFulfilled) {
        isFulfilled = true;
        throw err;
      }

      if (isFulfilled) {
        assert.ok(ctx.isRejected);
        assert.equal(ctx.error, err);
        done();
      } else {
        done(new Error('must trigger fulfilled event first'));
      }
    });

    app.init();
  });
});
