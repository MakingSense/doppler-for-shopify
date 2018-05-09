class HooksRoutes {

    constructor(redisClientFactory, dopplerClientFactory, shopifyClientFactory) {
      this.redisClientFactory = redisClientFactory;
      this.dopplerClientFactory = dopplerClientFactory;
      this.shopifyClientFactory = shopifyClientFactory;
    }

    async appUninstalled(error, request) {
        if (error) {
            console.error(error);
            return;
        }
        const jsonPayload = JSON.parse(request.body);
        const redis = this.redisClientFactory.createClient();
        await redis.removeShopAsync(jsonPayload.domain, true);
    }

    async customerCreated(error, request) {
        if (error) {
            console.error(error);
            return;
        }

        const redis = this.redisClientFactory.createClient();
        const shopDomain = request.get('X-Shopify-Shop-Domain');
        const shopInstance = await redis.getShopAsync(shopDomain, true);
        
        if (shopInstance == null || shopInstance.dopplerListId == null) return;

        const customer = JSON.parse(request.body);
        const doppler = this.dopplerClientFactory.createClient();
        await doppler.createSubscriberAsync(customer, shopInstance.dopplerListId, JSON.parse(shopInstance.fieldsMapping));
    }

    async dopplerImportTaskCompleted(request, response) {
        const shop = request.query.shop;
        const redis = this.redisClientFactory.createClient();
        await redis.storeShopAsync(shop, { synchronizationCompleted: true }, true);
        response.send('Thank you!');
    }
}

module.exports = HooksRoutes;
