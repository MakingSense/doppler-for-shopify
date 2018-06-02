const routes = require('./routes.js');

module.exports = function(app, withWebhook, hooksController) {
  app.use(routes(withWebhook, hooksController));
};
