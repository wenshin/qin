const createMiddleware = require('./createMiddleware');
const PathPattern = require('./PathPattern');
const Router = require('./Router');

createMiddleware.Router = Router;
createMiddleware.PathPattern = PathPattern;
module.exports = createMiddleware;
