class HooksController {
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

    try
    {
      const shopDomain = request.webhook.shopDomain;

      const redis = this.redisClientFactory.createClient();
      await redis.removeShopAsync(shopDomain, true);
    } catch (err) {
      console.error(err);
    }
  }

  async customerCreated(error, request) {
    if (error) {
      return;
    }

    try
    {
      const redis = this.redisClientFactory.createClient();
      const shopInstance = await redis.getShopAsync(request.webhook.shopDomain, false);

      if (
        !shopInstance ||
        !shopInstance.dopplerListId ||
        !shopInstance.fieldsMapping
      )
      {
        await redis.quitAsync();
        return;
      }

      const customer = JSON.parse(request.body);
      const doppler = this.dopplerClientFactory.createClient(shopInstance.dopplerAccountName, shopInstance.dopplerApiKey);
      
      await doppler.createSubscriberAsync(
        customer,
        shopInstance.dopplerListId,
        JSON.parse(shopInstance.fieldsMapping)
      );

      shopInstance.synchronizedCustomersCount = (parseInt(shopInstance.synchronizedCustomersCount) || 0) + 1;

      await redis.storeShopAsync(request.webhook.shopDomain, shopInstance, true);
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
