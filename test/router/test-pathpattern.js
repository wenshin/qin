const assert = require('assert');
const PathPattern = require('src/router/PathPattern');

describe('PathPattern', () => {
  it('root path', () => {
    const pattern = new PathPattern('/');
    assert.ok(pattern.match('/').match);
    assert.ok(!pattern.match('/test').match);
  });

  it('params', () => {
    const pattern = new PathPattern('/test/:name');
    const matchInfo = pattern.match('/test/yuanwen');
    assert.ok(matchInfo.match);
    assert.ok(!matchInfo.prefix);
    assert.equal(matchInfo.params.name, 'yuanwen');
  });

  it('prefix match without params', () => {
    const pattern = new PathPattern('/test');
    const noprefixMatchInfo = pattern.match('/test/username');
    const prefixMatchInfo = pattern.match('/test/username', true);
    assert.ok(!noprefixMatchInfo.match);
    assert.ok(prefixMatchInfo.match);
    assert.ok(prefixMatchInfo.prefix);
  });

  it('prefix match with params', () => {
    const pattern = new PathPattern('/test/:name');
    const noprefixMatchInfo = pattern.match('/test/wenshin/username');
    const prefixMatchInfo = pattern.match('/test/wenshin/username', true);
    assert.ok(!noprefixMatchInfo.match);
    assert.ok(prefixMatchInfo.match);
    assert.ok(prefixMatchInfo.prefix);
    assert.equal(prefixMatchInfo.params.name, 'wenshin');
  });
});
