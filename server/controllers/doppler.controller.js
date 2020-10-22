class DopplerController {
    constructor(redisClientFactory, appController, dopplerClientFactory) {
      this.redisClientFactory = redisClientFactory;
      this.appController = appController;
      this.dopplerClientFactory = dopplerClientFactory;
    }

    async getShops({ dopplerData }, response) {
        const redis = this.redisClientFactory.createClient();
        const shops = (await redis.getAllShopDomainsByDopplerDataAsync(dopplerData, false))
          .map(async shopName => {
            let shop = await redis.getShopAsync(shopName);
            return {
                shopName: shopName,
                shopifyAccessToken: (shop && shop.accessToken),
                connectedOn: (shop && shop.connectedOn),
                dopplerListId: (shop && shop.dopplerListId),
                dopplerListName: (shop && shop.dopplerListName),
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
      try {
        const shopInstance = await redis.getShopAsync(body.shopDomain);
        await redis.storeShopAsync(body.shopDomain, shopInstance);
        response.json(!!shopInstance);
      } finally {
        await redis.quitAsync();
      }
    }
    
    async uninstallShop({ dopplerData: { isSuperUser }, body: { shop } }, response) {
      if (!isSuperUser) {
          response.status(403).send(`Super user is required.`);
          return;
      }
      const redis = this.redisClientFactory.createClient();
      try { 
          const shopInstance = await redis.getShopAsync(shop);
          if (!shopInstance) {
            response.status(404).send(`Shop ${shop} not found.`);
            return;
          }
          await redis.removeShopAsync(shop);
          const doppler = this.dopplerClientFactory.createClient(shopInstance.dopplerAccountName, shopInstance.dopplerApiKey);
          await doppler.deleteShopifyIntegrationAsync();
          response.sendStatus(200);
      } finally {
        await redis.quitAsync();
      }
    }
}

module.exports = DopplerController;