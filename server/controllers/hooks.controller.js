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

    const shopDomain = request.webhook.shopDomain;

    const redis = this.redisClientFactory.createClient();
    await redis.removeShopAsync(shopDomain, true);
  }

  async customerCreated(error, request) {
    if (error) {
      return;
    }

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

  async dopplerImportTaskCompleted(request, response) {
    const shop = request.query.shop;
    const redis = this.redisClientFactory.createClient();
    await redis.storeShopAsync(
      shop,
      { synchronizationInProgress: false },
      true
    );
    response.send('Thank you!');
  }
}

module.exports = HooksController;
