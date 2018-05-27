import Utils from './utils';

// Generic "model" object. You can use whatever
// framework you want. For this application it
// may not even be worth separating this logic
// out, but we do this to demonstrate one way to
// separate out parts of your application.
function TodoModel(key) {
  this.key = key;
  this.todos = Utils.store(key);
  this.onChanges = [];
}

TodoModel.prototype.inform = function inform() {
  Utils.store(this.key, this.todos);
  this.onChanges.forEach(cb => cb());
};

TodoModel.prototype.addTodo = function addTodo(title) {
  this.todos = this.todos.concat({
    id: Utils.uuid(),
    title,
    completed: false
  });

  this.inform();
};

TodoModel.prototype.toggleAll = function toggleAll(checked) {
  // Note: it's usually better to use immutable data structures since they're
  // easier to reason about and React works very well with them. That's why
  // we use map() and filter() everywhere instead of mutating the array or
  // todo items themselves.
  this.todos = this.todos.map(todo => (
    Utils.extend({}, todo, {completed: checked})
  ));

  this.inform();
};

TodoModel.prototype.toggle = function toggle(todoToToggle) {
  this.todos = this.todos.map((todo) => {
    return todo !== todoToToggle ?
      todo :
      Utils.extend({}, todo, {completed: !todo.completed});
  });

  this.inform();
};

TodoModel.prototype.destroy = function destroy(todo) {
  this.todos = this.todos.filter((candidate) => {
    return candidate !== todo;
  });

  this.inform();
};

TodoModel.prototype.save = function save(todoToSave, text) {
  this.todos = this.todos.map((todo) => {
    return todo !== todoToSave ? todo : Utils.extend({}, todo, {title: text});
  });

  this.inform();
};

TodoModel.prototype.clearCompleted = function clearCompleted() {
  this.todos = this.todos.filter((todo) => {
    return !todo.completed;
  });

  this.inform();
};
