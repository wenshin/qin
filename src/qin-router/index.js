const createHistory = require('./createHistory');
const createRouter = require('./createRouter');
const PathPattern = require('./PathPattern');
const history = require('./history');

module.exports = {
  ...history,
  PathPattern,
  createHistory,
  createRouter
};
