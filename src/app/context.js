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

  get isAborted() {
    return this.event.status === 'aborted';
  },

  get error() {
    return this.event.errors[this.event.errors.length - 1];
  },

  set error(val) {
    this.event.errors.push(val);
  },

  /**
   * app delegates
   */
  get events() {
    return this.$app.events;
  },

  get shareState() {
    return this.$app.state;
  },

  /**
   * location delegates
   */
  get state() {
    return this.location.state;
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
  },

  /**
   * methods
   */
  dispatch(...args) {
    return this.$app.dispatch(...args);
  }
};

function contextMixin(App) {
  App.context = contextProto;

  Object.assign(App.prototype, {
    createContext(event) {
      return Object.create(contextProto, {
        $app: {writable: false, configurable: false, value: this},
        event: {writable: false, configurable: false, value: event},
        // location is changable, like history middware
        location: {writable: true, value: this.location},
        previousLocation: {writable: false, configurable: false, value: this.location},
      });
    }
  });
}

contextMixin.contextProto = contextProto;
