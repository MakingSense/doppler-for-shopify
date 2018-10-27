const routes = require('./routes.js');

module.exports = function(app, dopplerController) {
  app.use(routes(dopplerController));
};
