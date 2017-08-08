const initMixin = require('./init');
const contextMixin = require('./context');
const dispatchMixin = require('./dispatch');
const emitterMixin = require('./emitter');
const middlewareMixin = require('./middleware');
const listenMixin = require('./listen');

module.exports = App;

function App(options) {
  if (typeof options !== 'object') {
    throw new TypeError('App.constructor(options) options is needed which should be a object');
  }
  assertObjectType(
    options.emitter,
    ['on', 'emit', 'once', 'removeListener|off'],
    'App.constructor({emitter}) emitter can be a NodeJS EventEmitter or'
  );

  if ('pendingDelay' in options
    && (typeof options.pendingDelay !== 'number' || options.pendingDelay < 0)
  ) {
    throw new TypeError('App.constructor(options) options.pendingDelay should be a number great than -1');
  }

  this._initInstance(options);
}

initMixin(App);
contextMixin(App);
dispatchMixin(App);
emitterMixin(App);
middlewareMixin(App);
listenMixin(App);

function assertObjectType(obj, props, prefix) {
  const isObj = obj && typeof obj === 'object';
  let match = true;
  if (isObj) {
    for (let i = 0; i < props.length; i++) {
      const propsOr = props[i].split('|');
      let matchOr = false;
      for (let j = 0; j < propsOr.length; j++) {
        const prop = propsOr[j];
        if (prop in obj) {
          matchOr = true;
          break;
        }
      }
      if (!matchOr) {
        match = false;
        break;
      }
    }
  }
  if (!match) {
    throw new TypeError(`${prefix} should be a object type of {${props.join(',')}}`);
  }
}
