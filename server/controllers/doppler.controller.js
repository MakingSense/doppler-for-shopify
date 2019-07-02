class DopplerController {
    constructor(redisClientFactory, appController) {
      this.redisClientFactory = redisClientFactory;
      this.appController = appController;
    }

    async getShops(request, response) {
        const {
          dopplerData: { apiKey }
        } = request;

        const redis = this.redisClientFactory.createClient();
        const shops = (await redis.getShopsAsync(apiKey, false))
        .map(async shopName => {
            let shop = await redis.getShopAsync(shopName);
            return {
                shopName: shopName,
                shopifyAccessToken: (shop && shop.accessToken),
                connectedOn: (shop && shop.connectedOn),
                dopplerListId: (shop && shop.dopplerListId),
                importedCustomersCount: (shop && shop.synchronizedCustomersCount),
                syncProcessDopplerImportSubscribersTaskId: (shop && shop.importTaskId),
                syncProcessInProgress: (shop && shop.synchronizationInProgress),
                syncProcessLastRunDate: (shop && shop.lastSynchronizationDate)
            };
        });
        
        response.json(await Promise.all(shops));
        await redis.quitAsync();
    }

    async synchronizeCustomers({ query: { force }, dopplerData: { apiKey }, body: { shop } }, response) {
      const redis = this.redisClientFactory.createClient();
      const shopInstance = await redis.getShopAsync(shop);

      if (apiKey != shopInstance.dopplerApiKey) {
          response.sendStatus(403);
          return;
      }

      await this.appController.synchronizeCustomers({ query: { force }, session: { shop, accessToken: shopInstance.accessToken } }, response);
    }

    async migrateShop({ body }, response) {
      const redis = this.redisClientFactory.createClient();
      const shopInstance = await redis.getShopAsync(body.shopDomain, true);
      response.json(!!shopInstance);
    }
}

module.exports = DopplerController;