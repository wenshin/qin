const util = {
  g: (0, eval)('this') || {},

  get location() {
    return util.g.location || {replace() {}};
  },

  get history() {
    return util.g.history || {state: {}, go() {}, forward() {}, back() {}};
  },

  setDocumentTitle(title) {
    return title && (util.g.document.title = title);
  }
};

module.exports = util;
