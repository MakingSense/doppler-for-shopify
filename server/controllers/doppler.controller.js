class DopplerController {
    constructor(redisClientFactory) {
      this.redisClientFactory = redisClientFactory;
    }

    async getShops(request, response) {
        const {
            session: { dopplerApiKey }
        } = request;

        const redis = this.redisClientFactory.createClient();
        const shops = (await redis.getShopsAsync(dopplerApiKey, false))
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
}

module.exports = DopplerController;