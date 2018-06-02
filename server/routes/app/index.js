const routes = require("./routes.js");

module.exports = function (app, withShop, appController) {
    app.use(routes(withShop, appController));
}