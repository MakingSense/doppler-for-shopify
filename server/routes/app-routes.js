const shopifyFields = require ('../modules/shopify-extras').customerFields;

class AppRoutes {

  constructor(redisClientFactory, dopplerClientFactory, shopifyClientFactory){
    this.redisClientFactory = redisClientFactory;
    this.dopplerClientFactory = dopplerClientFactory;
    this.shopifyClientFactory = shopifyClientFactory;
  }

  async home(request, response) {
      const { session: { shop, accessToken } } = request;
      
      const redis = this.redisClientFactory.createClient();
      const shopInstance = await redis.getShopAsync(shop, true);

      // TODO: - should we move this to middleware in order to filter all requests? 
      //       - No, we should destroy the session when uninstalling the app.
      if (shopInstance === null || shopInstance.accessToken !== accessToken) {
        response.redirect(`/shopify/auth?shop=${shop}`);
        return;
      }

      response.render('app', {
        title: 'Doppler for Shopify',
        apiKey: process.env.SHOPIFY_APP_KEY,
        shop: shop,
        dopplerAccountName: shopInstance.dopplerAccountName,
        dopplerListId: shopInstance.dopplerListId
      });
  }

  async connectToDoppler(request, response) {
    const { session: { shop }, body: { dopplerAccountName, dopplerApiKey } } = request;
    
    const doppler = this.dopplerClientFactory.createClient(dopplerAccountName, dopplerApiKey);
    const validCredentials = await doppler.AreCredentialsValidAsync();
    
    if (!validCredentials) {
      response.sendStatus(401);
      return;
    }

    const redis = this.redisClientFactory.createClient();
    await redis.storeShopAsync(shop, { dopplerAccountName, dopplerApiKey }, true);
    response.sendStatus(200);
  }

  async getDopplerLists(request, response) {
      const { session: { shop } } = request;

      const redis = this.redisClientFactory.createClient();
      const shopInstance = await redis.getShopAsync(shop, true);

      const doppler = this.dopplerClientFactory.createClient(shopInstance.dopplerAccountName, shopInstance.dopplerApiKey);
      const lists = await doppler.getListsAsync();

      response.json(lists);
  }

  async createDopplerList(request, response) {
    const { session: { shop }, body: { name } } = request;
    
    const redis = this.redisClientFactory.createClient();
    const shopInstance = await redis.getShopAsync(shop, true);

    const doppler = this.dopplerClientFactory.createClient(shopInstance.dopplerAccountName, shopInstance.dopplerApiKey);

    try {
      const listId = await doppler.createListAsync(name);
      response.status(201).send({ listId });
    } catch (error) {
      if (error.errorCode === 2 && error.statusCode === 400)
        response.sendStatus(400);
      else
        throw error;
    }
  }

  async setDopplerList(request, response) {
    const { session: { shop }, body: { dopplerListId } } = request;
    
    const redis = this.redisClientFactory.createClient();
    await redis.storeShopAsync(shop, { dopplerListId }, true);

    response.sendStatus(200);
  }
  
  async getFields(request, response) {
    const { session: { shop } } = request;
    
    const redis = this.redisClientFactory.createClient();
    const shopInstance = await redis.getShopAsync(shop, true);

    const doppler = this.dopplerClientFactory.createClient(shopInstance.dopplerAccountName, shopInstance.dopplerApiKey);
    const dopplerFields = await doppler.getFieldsAsync();

    response.json({ shopifyFields, dopplerFields });
  }

  async setFieldsMapping(request, response) {
    const { session: { shop }, body: { fieldsMapping } } = request;
    
    const redis = this.redisClientFactory.createClient();
    const shopInstance = await redis.storeShopAsync(shop, { fieldsMapping }, true);

    response.sendStatus(200);
  }

  //TODO: this is a heavyweight process, maybe we should do it all asynchronous
  async synchronizeCustomers(request, response) { 
    const { session: { shop, accessToken } } = request;

    const shopify = this.shopifyClientFactory.createClient(shop, accessToken);
    
    // TODO: if webhook creation fails, should we continue with the synchronization?
    await shopify.webhook.create({
      topic: 'customers/create',
      address: `${process.env.SHOPIFY_APP_HOST}/hooks/customers/created`,
      format: 'json'
    });
    const customers = await shopify.customer.list();

    const redis = this.redisClientFactory.createClient();
    const shopInstance = await redis.getShopAsync(shop);

    const doppler = this.dopplerClientFactory.createClient(shopInstance.dopplerAccountName, shopInstance.dopplerApiKey);
    
    const importTaskId = await doppler.importSubscribersAsync(
      customers, 
      shopInstance.dopplerListId,
      shop, 
      JSON.parse(shopInstance.fieldsMapping)
    );
    
    await redis.storeShopAsync(shop, { importTaskId }, true);

    response.sendStatus(201);
  }
}

module.exports = AppRoutes;