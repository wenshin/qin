const url = require('url');
const eventListener = require('eventlistener');
const History = require('./History');
const util = require('./util');


class HashHistory extends History {
  constructor(options = {}) {
    super(options);

    const loc = getLocation(util.location);
    this.setLocation(loc);

    this.hashStackMap = {
      [getHash(loc)]: 0
    };

    eventListener.add(util.g, 'hashchange', () => {
      if (util.location.hash === getHash(this.location)) return;
      this._cur = this.hashStackMap[util.location.hash] || 0;
      this.location = getLocation(util.location);
      this.emit('location', this.location);
    });
  }

  _go(delta) {
    util.g.history.go(delta);
  }

  _replace(location) {
    const hash = getHash(location);
    this.hashStackMap[hash] = this._cur;
    util.location.replace(hash);
    util.setDocumentTitle(location.title);
  }

  _push(location) {
    const hash = getHash(location);
    this.hashStackMap[hash] = this._cur;
    util.g.location.hash = hash;
    util.setDocumentTitle(location.title);
  }
}


module.exports = HashHistory;


function getLocation(hashLocation) {
  let path = '/';
  if (hashLocation.hash) {
    path = util.location.hash.substring(1);
  }
  return url.parse(path, true);
}

function getHash(location) {
  return `#${url.format({
    pathname: location.pathname,
    search: location.search,
    hash: location.hash
  })}`;
}
