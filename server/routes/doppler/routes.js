const Router = require('express').Router;
const json = require('body-parser').json;
const wrapAsync = require('../../helpers/wrapAsync');
const withDoppler =  require('../../helpers/withDoppler');
var cors = require('cors');

const corsHandler = cors({
  credentials: true,
  origin: [
    'https://app.fromdoppler.com',
    'http://cdn.fromdoppler.com',
    'https://cdn.fromdoppler.com',
    'https://app.fromdoppler.com:4443',
    'https://app.fromdoppler.com:4444'
  ],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['ETag']
});
module.exports = function(dopplerController) {
  // TODO: deprecate `/me/...` routes and use `/doppler/{accountName}/...` ones
  // in place of them. In that way, we could allow SuperUser JWT tokens  
  const router = new Router();

  // If I do not add this route, the server do not include Access-Control-Allow-Origin
  // header in OPTIONS request. See: https://github.com/expressjs/cors/issues/2#issuecomment-17137451
  router.options('/me/shops', corsHandler);
  router.get(
    '/me/shops',
    corsHandler,
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
