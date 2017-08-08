const util = {
  get g() {
    if (typeof process !== 'undefined' && isType(process, 'process')) {
      return global;
    }
    return window;
  },

  get location() {
    return window.location || {replace() {}};
  },

  isType,

  parseQuery(search) {
    if (!search) return {};
    if (typeof search !== 'string') {
      throw new TypeError('parseQuery(search) search must be a string');
    }
    const fields = search.trim().substr(1).split('&').map(q => q.split('='));
    const query = {};
    for (let i = 0; i < fields.length; i++) {
      const [key, value] = fields[i];
      query[key] = value || '';
    }
    return query;
  }
};

module.exports = util;

function isType(value, typeName) {
  const type = `[object ${typeName.toLowerCase()}]`;
  return type === Object.prototype.toString.call(value).toLowerCase();
}
