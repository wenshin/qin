const qin = require('qin');
const Emitter = require('events');

const app = new qin.createApp({
  emitter: new Emitter(),
  state:
  location: new Location(),
});

app
  .listen((ctx) => {

  })
  .then();

[
  {
    path: '/app',
    controller() {

    }
  },
  {
    path: '/app/render/:id',
    controller() {

    }
  },
  {
    path: '/app/render/2',
    controller() {

    }
  }
]
