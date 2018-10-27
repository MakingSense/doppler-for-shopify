const Router = require('express').Router;
const json = require('body-parser').json;
const wrapAsync = require('../../helpers/wrapAsync');
const withDoppler =  require('../../helpers/withDoppler');

module.exports = function(dopplerController) {
  const router = new Router();
  router.get(
    '/me/shops',
    withDoppler(),
    json(),
    wrapAsync((req, res) => dopplerController.getShops(req, res))
  );
  
  return router;
};
