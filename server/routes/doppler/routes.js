const Router = require('express').Router;
const json = require('body-parser').json;
const wrapAsync = require('../../helpers/wrapAsync');
const withDoppler =  require('../../helpers/withDoppler');

module.exports = function(dopplerController) {
  // TODO: deprecate `/me/...` routes and use `/doppler/{accountName}/...` ones
  // in place of them. In that way, we could allow SuperUser JWT tokens  
  const router = new Router();
  router.get(
    '/me/shops',
    withDoppler(),
    json(),
    wrapAsync((req, res) => dopplerController.getShops(req, res))
  );
  router.post(
    '/me/synchronize-customers',
    withDoppler(),
    json(),
    wrapAsync((req, res) => dopplerController.synchronizeCustomers(req, res))
  );
  router.post(
    '/me/migrate-shop',
    json(),
    wrapAsync((req, res) => dopplerController.migrateShop(req, res))
  );
  return router;
};
