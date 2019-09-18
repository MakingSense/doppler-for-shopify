const shopifyFields = require('../modules/shopify-extras').customerFields;
const shopifyCustomersPageSize = require('../modules/shopify-extras').shopifyCustomersPageSize;

class AppController {
  constructor(redisClientFactory, dopplerClientFactory, shopifyClientFactory) {
    this.redisClientFactory = redisClientFactory;
    this.dopplerClientFactory = dopplerClientFactory;
    this.shopifyClientFactory = shopifyClientFactory;
  }

  afterAuth(request, response) {
    const { session: { accessToken, shop } } = request;
    const shopify = this.shopifyClientFactory.createClient(shop, accessToken);

    shopify.webhook
      .create({
        topic: 'app/uninstalled',
        address: `${process.env.SHOPIFY_APP_HOST}/hooks/app/uninstalled`,
        format: 'json',
      })
      .then(() => {})
      .catch(err => console.error(err));

    shopify.webhook
      .create({
        topic: 'customers/create',
        address: `${process.env.SHOPIFY_APP_HOST}/hooks/customers/created`,
        format: 'json',
      })
      .then(() => {})
      .catch(err => console.error(err));

      shopify.scriptTag
        .create({
          event: "onload",
          src: "https://hub.fromdoppler.com/public/dhtrack.js"
        })
        .then(() => {})
        .catch(err => console.error(err));

      response.redirect('/');
  }

  async home(request, response) {
    const { session: { shop, accessToken } } = request;

    const redis = this.redisClientFactory.createClient();

    const shopInstance = await redis.getShopAsync(shop, true);

    if (shopInstance === null || shopInstance.accessToken !== accessToken) {
      response.redirect(`/shopify/auth?shop=${shop}`);
      return;
    }

    let dopplerList = null;

    try {
      if (shopInstance.dopplerAccountName && shopInstance.dopplerApiKey && shopInstance.dopplerListId) {
        const doppler = this.dopplerClientFactory.createClient(
          shopInstance.dopplerAccountName,
          shopInstance.dopplerApiKey
        );

        dopplerList = await doppler.getListAsync(shopInstance.dopplerListId);
      }

    } catch (error) {
      // We don't want to crash the app if the Doppler API is not responding
      console.debug(error);
    }
    

    response.render('app', {
      title: 'Doppler for Shopify',
      apiKey: process.env.SHOPIFY_APP_KEY,
      shop: shop,
      dopplerAccountName: shopInstance.dopplerAccountName,
      dopplerListId: shopInstance.dopplerListId,
      dopplerListName: dopplerList ? dopplerList.name : shopInstance.dopplerListName,
      fieldsMapping: shopInstance.fieldsMapping,
      setupCompleted:
        shopInstance.dopplerListId && shopInstance.fieldsMapping ? true : false,
      synchronizationInProgress: shopInstance.synchronizationInProgress
        ? false
        : shopInstance.synchronizationInProgress,
      lastSynchronizationDate: shopInstance.lastSynchronizationDate,
    });
  }

  async connectToDoppler({ session: { accessToken, shop }, body: { dopplerAccountName, dopplerApiKey } }, response) {
    const doppler = this.dopplerClientFactory.createClient(
      dopplerAccountName,
      dopplerApiKey
    );
    const validCredentials = await doppler.AreCredentialsValidAsync();

    if (!validCredentials) {
      response.sendStatus(401);
      return;
    }

    const redis = this.redisClientFactory.createClient();
    try {
      await redis.storeShopAsync(
        shop,
        { dopplerAccountName, dopplerApiKey, connectedOn: new Date().toISOString(), synchronizedCustomersCount: 0 });
      await doppler.putShopifyIntegrationAsync(shop, accessToken);
    } catch (error) {
      await redis.removeShopAsync(shop);
      throw error;
    } finally {
      await redis.quitAsync();
    }

    response.sendStatus(200);
  }

  async getDopplerLists(request, response) {
    const { session: { shop } } = request;

    const redis = this.redisClientFactory.createClient();
    const shopInstance = await redis.getShopAsync(shop, true);

    const doppler = this.dopplerClientFactory.createClient(
      shopInstance.dopplerAccountName,
      shopInstance.dopplerApiKey
    );

    const lists = await doppler.getListsAsync();
    
    if ((typeof(shopInstance.dopplerListId) == "undefined" || shopInstance.dopplerListId == null) 
      && !lists.items.find(l => l.name == "Shopify Contacto")) {
        lists.items.unshift({ listId: -1, name: "Shopify Contacto" });
        lists.itemsCount++;
    }

    response.json(lists);
  }

  async createDopplerList(request, response) {
    const { session: { shop }, body: { name } } = request;

    const redis = this.redisClientFactory.createClient();
    const shopInstance = await redis.getShopAsync(shop, true);

    const doppler = this.dopplerClientFactory.createClient(
      shopInstance.dopplerAccountName,
      shopInstance.dopplerApiKey
    );

    try {
      const listId = await doppler.createListAsync(name);
      response.status(201).send({ listId });
    } catch (error) {
      if (error.errorCode === 2 && error.statusCode === 400)
        response.sendStatus(400);
      else throw error;
    }
  }

  async setDopplerList(request, response) {
    let {
      session: { shop },
      body: { dopplerListId, dopplerListName },
    } = request;

    const redis = this.redisClientFactory.createClient();

    if (dopplerListId == -1) {
      try {
        const shopInstance = await redis.getShopAsync(shop, false);

        const doppler = this.dopplerClientFactory.createClient(
          shopInstance.dopplerAccountName,
          shopInstance.dopplerApiKey
        );

        dopplerListId = await doppler.createListAsync("Shopify Contacto");
        dopplerListName = "Shopify Contacto";
      } catch (error) {
        if (error.errorCode === 2 && error.statusCode === 400) {
          response.sendStatus(400);
          return;
        }
        else throw error;
      }
    }

    await redis.storeShopAsync(shop, { dopplerListId, dopplerListName }, true);

    response.status(200).send({ dopplerListId });
  }

  async getFields(request, response) {
    const { session: { shop } } = request;

    const redis = this.redisClientFactory.createClient();
    const shopInstance = await redis.getShopAsync(shop, true);

    const doppler = this.dopplerClientFactory.createClient(
      shopInstance.dopplerAccountName,
      shopInstance.dopplerApiKey
    );
    const dopplerFields = await doppler.getFieldsAsync();

    response.json({ shopifyFields, dopplerFields, fieldsMapping: shopInstance.fieldsMapping 
      ? JSON.parse(shopInstance.fieldsMapping)
        .filter(m => dopplerFields.some(d =>  d.name === m.doppler))
      : null });
  }

  async setFieldsMapping(request, response) {
    const { session: { shop }, body: { fieldsMapping } } = request;

    const redis = this.redisClientFactory.createClient();

    await redis.storeShopAsync(
      shop,
      { fieldsMapping: JSON.stringify(fieldsMapping) },
      true
    );

    response.sendStatus(200);
  }

  //TODO: this is a heavyweight process, maybe we should do it all asynchronous
  async synchronizeCustomers({ query: { force }, session: { shop, accessToken } }, response) {
    // undefined and null will be false
    // '', 0, 'false', 'true', another string, number or object will be true
    // POST /synchronize-customers?force => true
    // POST /synchronize-customers => false
    force = force != null;
    const redis = this.redisClientFactory.createClient();
    const shopInstance = await redis.getShopAsync(shop);
    try {
      if (!force && shopInstance.synchronizationInProgress && JSON.parse(shopInstance.synchronizationInProgress)) {
        response.status(400).send("There is another synchronization process in progress. Please try again later.");
        return;
      }

      let lastStep = 'update-plugin-status-start-sync';
      try {
        await redis.storeShopAsync(
          shop,
          {
            synchronizationInProgress: true,
            lastSynchronizationDate: new Date().toISOString(),
          });

        lastStep = 'count-customers';
        const shopify = this.shopifyClientFactory.createClient(shop, accessToken);
        const totalCustomers = await shopify.customer.count();

        lastStep = 'prepare-customers-list';
        let customers = [];
        for (let pageNumber = 1; pageNumber <= totalCustomers/shopifyCustomersPageSize + 1; pageNumber++)
        {
          customers = customers.concat((await shopify.customer.list({ limit: shopifyCustomersPageSize, page: pageNumber }))
            .filter(customer => !!customer.email));
        }

        lastStep = 'send-data-to-doppler';
        const doppler = this.dopplerClientFactory.createClient(
          shopInstance.dopplerAccountName,
          shopInstance.dopplerApiKey);
        const importTaskId = await doppler.importSubscribersAsync(
          customers,
          shopInstance.dopplerListId,
          shop,
          JSON.parse(shopInstance.fieldsMapping));

        lastStep = 'update-plugin-status-sync-in-progress';
        await redis.storeShopAsync(
          shop, 
          { 
            importTaskId: importTaskId,
            synchronizedCustomersCount: customers.length,
          });
      } catch (error) {
        const _redis = this.redisClientFactory.createClient();
        await _redis.storeShopAsync(
          shop,
          {
            synchronizationInProgress: false,
            lastSynchronizationDate: '',
          });
        throw new Error(`Error synchronizing customers (step: ${lastStep}): ${error.message}`);
      }
    }
    finally {
      await redis.quitAsync();
    }
    response.sendStatus(201);
  }

  async getSynchronizationStatus(request, response) {
    const { session: { shop } } = request;

    const redis = this.redisClientFactory.createClient();
    
    const shopInstance = await redis.getShopAsync(shop, true);

    response.json({
      synchronizationInProgress: shopInstance.synchronizationInProgress ? JSON.parse(shopInstance.synchronizationInProgress) : false });
  }
}

module.exports = AppController;
