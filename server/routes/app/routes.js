const Router = require('express').Router;
const json = require('body-parser').json;
const wrapAsync = require('../../helpers/wrapAsync');

module.exports = function(withShop, appController) {
  const router = new Router();
  router.get(
    '/',
    withShop({ authBaseUrl: '/shopify' }),
    wrapAsync((req, res) => appController.home(req, res))
  );
  router.post(
    '/connect-to-doppler',
    withShop({ authBaseUrl: '/shopify' }),
    json(),
    wrapAsync((req, res) => appController.connectToDoppler(req, res))
  );
  router.get(
    '/doppler-lists',
    withShop({ authBaseUrl: '/shopify' }),
    wrapAsync((req, res) => appController.getDopplerLists(req, res))
  );
  router.post(
    '/create-doppler-list',
    withShop({ authBaseUrl: '/shopify' }),
    json(),
    wrapAsync((req, res) => appController.createDopplerList(req, res))
  );
  router.post(
    '/doppler-list',
    withShop({ authBaseUrl: '/shopify' }),
    json(),
    wrapAsync((req, res) => appController.setDopplerList(req, res))
  );
  router.get(
    '/fields',
    withShop({ authBaseUrl: '/shopify' }),
    wrapAsync((req, res) => appController.getFields(req, res))
  );
  router.post(
    '/fields-mapping',
    withShop({ authBaseUrl: '/shopify' }),
    json(),
    wrapAsync((req, res) => appController.setFieldsMapping(req, res))
  );
  router.post(
    '/synchronize-customers',
    withShop({ authBaseUrl: '/shopify' }),
    wrapAsync((req, res) => appController.synchronizeCustomers(req, res))
  );
  router.get(
    '/synchronization-status',
    withShop({ authBaseUrl: '/shopify' }),
    wrapAsync((req, res) => appController.getSynchronizationStatus(req, res))
  );
  return router;
};
