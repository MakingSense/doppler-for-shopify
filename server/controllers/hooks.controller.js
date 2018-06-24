class HooksController {
  constructor(redisClientFactory, dopplerClientFactory, shopifyClientFactory) {
    this.redisClientFactory = redisClientFactory;
    this.dopplerClientFactory = dopplerClientFactory;
    this.shopifyClientFactory = shopifyClientFactory;
  }

  async appUninstalled(error, request) {
    if (error) {
      return;
    }

    try
    {
      const shopDomain = request.webhook.shopDomain;

      const redis = this.redisClientFactory.createClient();
      await redis.removeShopAsync(shopDomain, true);
    }
    catch (err){}
  }

  async customerCreated(error, request) {
    if (error) {
      return;
    }

    try
    {
      const redis = this.redisClientFactory.createClient();
      const shopInstance = await redis.getShopAsync(
        request.webhook.shopDomain,
        true
      );

      if (
        !shopInstance ||
        !shopInstance.dopplerListId ||
        !shopInstance.fieldsMapping
      )
        return;

      const customer = JSON.parse(request.body);
      const doppler = this.dopplerClientFactory.createClient(
        shopInstance.dopplerAccountName,
        shopInstance.dopplerApiKey
      );
      await doppler.createSubscriberAsync(
        customer,
        shopInstance.dopplerListId,
        JSON.parse(shopInstance.fieldsMapping)
      );
    }
    catch(err){}
  }

  async dopplerImportTaskCompleted(request, response) {
    try
    {
      const shop = request.query.shop;
      const redis = this.redisClientFactory.createClient();
      await redis.storeShopAsync(
        shop,
        { synchronizationInProgress: false },
        true
      );
      response.send('Thank you!');
    }
    catch(err){}
  }
}

module.exports = HooksController;
