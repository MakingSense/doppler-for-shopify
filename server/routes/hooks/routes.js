const Router = require('express').Router;
const wrapAsync = require('../../helpers/wrapAsync');

module.exports = function (withWebhook, hooksController) {
    const router = new Router();
    router.post('/hooks/app/uninstalled', withWebhook(async (error, request) => { await hooksController.appUninstalled(error, request); }));
    router.post('/hooks/customers/created', withWebhook(async (error, request) => { await hooksController.customerCreated(error, request); }));
    router.post('/hooks/doppler-import-completed', wrapAsync((req, res) => hooksController.dopplerImportTaskCompleted(req, res)));
    return router;
}