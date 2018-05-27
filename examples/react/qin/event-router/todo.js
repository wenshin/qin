const Util = require('./utils');

module.exports = {
  fetchTodos(ctx) {
    const {state} = ctx;
  },
  addTodo(ctx) {
    const {state, event} = ctx;
    state.todos.push({
      id: Util.uuid(),
      title: event.data.title,
      completed: false
    });
  },
  toggleAll(ctx) {
    const {state, event} = ctx;
    const {checked} = event.data;
    state.todos = state.todos.map(todo => (
      Util.extend({}, todo, {completed: checked})
    ));
  },
  toggle(ctx) {
    const {state, event} = ctx;
    const {todoToToggle} = event.data;
    state.todos = state.todos.map((todo) => {
      return todo !== todoToToggle ?
        todo :
        Util.extend({}, todo, {completed: !todo.completed});
    });
  },
  destroy(ctx) {
    const {state, event} = ctx;
    state.todos = state.todos.filter((candidate) => {
      return candidate !== event.data;
    });
  },
  save(ctx) {
    const {state, event} = ctx;
    const {todoToSave, text} = event.data;
    state.todos = state.todos.map((todo) => {
      return todo !== todoToSave ? todo : Util.extend({}, todo, {title: text});
    });
  },
  clearCompleted(ctx) {
    const {state} = ctx;
    state.todos = state.todos.filter((todo) => {
      return !todo.completed;
    });
  }
};
