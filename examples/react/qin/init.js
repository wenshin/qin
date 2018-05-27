const store = require('store');

export default function (ctx, next) {
  ctx.state.todos = store.get();
}
