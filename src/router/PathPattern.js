class PathPattern {
  constructor(pattern) {
    if (!pattern || typeof pattern !== 'string') {
      throw new TypeError('path pattern must be a string');
    }
    this.pattern = removeLastSlash(pattern);
    this.paramsConfig = parsePattern(this.pattern);
    this.pathLength = this.pattern.split('/').length;
  }

  match(pathnameArg, matchPrefix) {
    if (!pathnameArg || typeof pathnameArg !== 'string') {
      throw new TypeError('pathnameArg must be a non-empty string');
    }
    const {keys, regexp} = this.paramsConfig;
    const re = new RegExp(regexp);
    const pathname = removeLastSlash(pathnameArg);
    const matched = pathname.match(re);

    if (!matched) {
      if (matchPrefix) {
        const rePrefix = new RegExp(`${regexp.slice(0, -1)}.+$`);
        const matchedPrefix = pathname.match(rePrefix);
        if (matchedPrefix) {
          return {
            match: true,
            prefix: true,
            params: getParams(keys, matchedPrefix)
          };
        }
      }
      return {match: false};
    }

    return {
      params: getParams(keys, matched),
      match: true
    };
  }

  cut(pathnameArg) {
    const pathname = removeLastSlash(pathnameArg);
    if (this.pattern === '/' || pathname === '/') {
      return '/';
    }
    return pathname.split('/').slice(0, this.pathLength).join('/');
  }
}

function parsePattern(pattern) {
  const paramRegExp = /:\w+/g;
  const paramKeysMatch = pattern.match(paramRegExp);
  let re = pattern;
  let keys = [];

  if (paramKeysMatch) {
    keys = paramKeysMatch.map(key => key.substr(1));
    re = pattern.replace(paramRegExp, '([\\w-]+)');
  }

  return {keys, regexp: `^${re}$`};
}

module.exports = PathPattern;

function removeLastSlash(path) {
  if (path === '/') return path;
  return path.replace(/\/$/, '');
}

function getParams(keys, matched) {
  const params = {};
  for (let i = 0; i < keys.length; i++) {
    params[keys[i]] = matched[i + 1];
  }
  return params;
}
