const url = require('url');

const LOCATION_PROPS = [
  'href',
  'protocal',
  'host',
  'hostname',
  'pathname',
  'hash',
  'params',
];

class Location {
  constructor(options) {
    assertConstructorOptions(options, 'href', 'string') // eslint-disable-line no-unused-expressions
      && assertConstructorOptions(options, 'path', 'string')
      && assertConstructorOptions(options, 'host', 'string')
      && assertConstructorOptions(options, 'protocal', 'string')
      && assertConstructorOptions(options, 'hostname', 'string')
      && assertConstructorOptions(options, 'pathname', 'string')
      && assertConstructorOptions(options, 'search', 'string')
      && assertConstructorOptions(options, 'hash', 'string')
      && assertConstructorOptions(options, 'title', 'string')
      // the path parameters
      && assertConstructorOptions(options, 'params', 'object')
      && assertConstructorOptions(options, 'query', 'object')
      && assertConstructorOptions(options, 'state', 'object');

    this._init(options);
  }

  _init(options) {
    // 去掉 window.location.href 的默认行为
    const iOptions = Object.assign({}, options);
    if (!iOptions.href && !iOptions.path && !iOptions.pathname) {
      iOptions.pathname = '/';
    }

    let urlObj = {};

    iOptions.href = iOptions.href ? decodeURIComponent(iOptions.href) : '';
    iOptions.search = iOptions.search ? decodeURIComponent(iOptions.search) : '';

    if (iOptions.href || iOptions.path) {
      urlObj = url.parse(iOptions.href || iOptions.path, true);
    }

    for (let i = 0; i < LOCATION_PROPS.length; i++) {
      const prop = LOCATION_PROPS[i];
      this[prop] = iOptions[prop] || urlObj[prop];
    }

    const search = iOptions.search || urlObj.search;
    let query = iOptions.query || urlObj.query;
    if (!query) {
      query = search && search !== '?'
        ? url.parse(search, true).query
        : {};
    }

    this.query = query;
    this.state = iOptions.state || {};
    this.methods = iOptions.methods || {};
    this.title = iOptions.title;
  }

  get search() {
    return url.format({query: this.query});
  }

  get path() {
    return this.pathname + this.search;
  }

  get pathhash() {
    return `${this.path}${this.hash || ''}`;
  }

  patchState(data) {
    return Object.assign(this.state, data);
  }

  is(path) {
    return removeLastSlash(this.path) === removeLastSlash(path);
  }

  /**
   * test pathname
   * @param  {String|Location}  path
   * @return {Boolean}
   */
  isBasePathOf(pathOrLocation) {
    if (!(pathOrLocation.path
          || typeof pathOrLocation === 'string'
          || typeof pathOrLocation === 'object')
    ) {
      throw new TypeError('Location.isBasePathOf(pathOrLocation) pathOrLocation must be a String Or Location');
    }
    const path = typeof pathOrLocation === 'string'
      ? pathOrLocation
      : pathOrLocation.path;
    const pathElem = splitPath(path);
    const curPathElem = splitPath(this.pathname);
    let isBaseOf = true;
    if (pathElem.length >= curPathElem.length) {
      for (let i = 0; i < curPathElem.length; i++) {
        isBaseOf = isBaseOf && curPathElem[i] === pathElem[i];
      }
    } else {
      isBaseOf = false;
    }
    return isBaseOf;
  }
}


Location.create = function create(options) {
  return new Location(options);
};


module.exports = Location;


function assertConstructorOptions(options, prop, type) {
  if (!options || typeof options !== 'object') {
    throw new TypeError('Location.constructor({path, pathname, href, search, query, state}) options should be a object.');
  }

  const value = options[prop];
  const isTypeOrOptional = !value || typeof value === type;  // eslint-disable-line valid-typeof
  if (!isTypeOrOptional) {
    throw new TypeError(`Location.constructor({path, pathname, href, search, query, state}) ${prop} should be a ${type} which is optional.`);
  }
  return isTypeOrOptional;
}

function splitPath(pathArg) {
  let path = pathArg.trim();
  if (path.indexOf('/') === 0) {
    path = path.slice(1);
  }
  if (path.slice(-1) === '/') {
    path = path.slice(0, -1);
  }
  return path.split('/');
}

function removeLastSlash(path) {
  return path.replace(/\/$/, '');
}
