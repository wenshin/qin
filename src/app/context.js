module.exports = contextMixin;

const contextProto = {
  /**
   * event delegates
   */
  get isPending() {
    return this.event.status === 'pending';
  },

  get isRejected() {
    return this.event.status === 'rejected';
  },

  get isFulfilled() {
    return this.event.status === 'fulfilled';
  },

  set error(val) {
    this.event.errors.push(val);
  },

  /**
   * app delegates
   */
  get events() {
    return this.app.events;
  },

  get appState() {
    return this.app.state;
  },

  get appMethods() {
    return this.app.methods;
  },

  /**
   * location delegates
   */
  get state() {
    return this.location.state;
  },

  get methods() {
    return this.location.methods;
  },

  get query() {
    return this.location.query;
  },

  get title() {
    return this.location.title;
  },
  set title(val) {
    this.location.title = val;
  },

  get view() {
    return this.location.view;
  },
  set view(val) {
    this.location.view = val;
  },

  get forbidden() {
    return this.location.forbidden;
  },
  set forbidden(val) {
    this.location.forbidden = val;
  }
};

function contextMixin(App) {
  App.context = contextProto;

  Object.assign(App.prototype, {
    createContext(event) {
      return Object.create(contextProto, {
        app: {writable: false, configurable: false, value: this},
        event: {writable: false, configurable: false, value: event},
        // location is changable, like history middware
        location: {writable: true, value: this.location}
      });
    }
  });
}
