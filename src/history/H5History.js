const eventListener = require('eventlistener');
const History = require('./History');
const util = require('./util');


// tab not close, the history not clean. but refresh will clean the memory
// browser navigation and history.back(), history.forward(), history.go()
// all will trigger popstate event
class H5History extends History {
  static isSupport() {
    return !!(util.g.history
      && util.g.history.pushState
      && util.g.history.replaceState
    );
  }

  constructor(options = {}) {
    super(options);

    const state = util.g.history.state || {};
    this.setLocation(
      Object.assign({state: state.data}, util.location),
      state.index
    );

    // handle history.go, history.back, history.forward and browser back and forward click
    eventListener.add(util.g, 'popstate', (e) => {
      const st = e.state || {};
      this.setLocation({...util.location, state: st.data}, st.index || 0);
      this.emit('location', this.location);
    });
  }

  _go(delta) {
    util.g.history.go(delta);
  }

  _replace(location) {
    util.g.history.replaceState(
      {index: this._cur, data: location.state},
      location.title,
      location.pathhash
    );
  }

  _push(location) {
    util.g.history.pushState(
      {index: this._cur, data: location.state},
      location.title,
      location.pathhash
    );
  }
}


module.exports = H5History;
