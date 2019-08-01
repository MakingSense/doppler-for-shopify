class HooksController {
  constructor(redisClientFactory, dopplerClientFactory, shopifyClientFactory) {
    this.redisClientFactory = redisClientFactory;
    this.dopplerClientFactory = dopplerClientFactory;
    this.shopifyClientFactory = shopifyClientFactory;
  }

  async safeGetShopAsync(redis, shopDomain) {
    try {
      return await redis.getShopAsync(shopDomain);
    } catch (error) {
      console.error(`Error loading shop ${shopDomain} from Redis DB`, error);
      return null;
    }
  }

  async safeRemoveShopAsync(redis, shopDomain) {
    try {
      await redis.removeShopAsync(shopDomain);
    } catch (error) {
      console.error(`Error removing shop ${shopDomain} from Redis DB`, error);
    }
  }

  async safeRemoveDopplerIntegrationAsync(shop) {
    if (!shop || !shop.dopplerAccountName || !shop.dopplerApiKey) {
      console.error('No enough data to remove Doppler integration.', { shop });
      return;
    }

    try {
      const doppler = this.dopplerClientFactory.createClient(shop.dopplerAccountName, shop.dopplerApiKey);
      await doppler.deleteShopifyIntegrationAsync();
    } catch (error) {
      console.error('Error removing integration from Doppler', error);
    }
  }

  async appUninstalled(error, request) {
    if (error) {
      console.error('appUninstalled hook', error);
      return;
    }

    const shopDomain = request.webhook && request.webhook.shopDomain;

    if (!shopDomain) {
      console.error('Shop domain not found in the request, cannot cleanup our data.')
      return;
    }

    const redis = this.redisClientFactory.createClient();

    try { 
      const shop = await this.safeGetShopAsync(redis, shopDomain);
      await this.safeRemoveShopAsync(redis, shopDomain);
      await this.safeRemoveDopplerIntegrationAsync(shop);
    } finally {
      await redis.quitAsync();
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
