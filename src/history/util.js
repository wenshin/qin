const isNode = typeof process !== 'undefined' && typeof global === 'object';

const util = {
  isNode,

  g() {
    if (isNode) {
      return global;
    }
    return window;
  },

  get location() {
    return util.g.location || {reload() {}, replace() {}};
  },

  get history() {
    return util.g.history || {state: {}, go() {}, forward() {}, back() {}};
  },

  setDocumentTitle(title) {
    return title && (util.g.document.title = title);
  }
};

module.exports = util;
