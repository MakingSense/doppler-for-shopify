const factories = {
  wrappedRedisClient: () => ({
    hmset: () => {},
    quit: () => {},
    hgetall: () => {},
    del: () => {},
    on: () => {},
    set: () => {},
    sadd: () => {},
    smembers: () => {},
    srem: () => {},
  }),
  redisClient: () => ({
    getShopAsync: function() {},
    getAllShopDomainsByDopplerDataAsync: () => {},
    getAllShopDomainsByDopplerApiKeyAsync: () => {},
    getAllShopDomainsByDopplerAccountNameAsync: () => {},
    storeShopAsync: () => {},
    removeShopAsync: () => {},
    quitAsync: () => {},
  }),
  dopplerClient: () => ({
    AreCredentialsValidAsync: () => {},
    getListsAsync: () => {},
    createListAsync: () => {},
    getFieldsAsync: () => {},
    importSubscribersAsync: () => {},
    createSubscriberAsync: () => {},
    disassociateSubscribersFromList: () => {},
    getListAsync: () => {},
    putShopifyIntegrationAsync: () => {},
    deleteShopifyIntegrationAsync: () => {},
  }),
  shopifyClient: () => ({
    webhook: {
      create: () => {},
    },
    customer: {
      list: () => {},
      count: () => {},
    },
    scriptTag: {
      create: () => {},
    },
  }),
  appController: () => ({
    synchronizeCustomers: () => {},
  })
};
    }
}
module.exports = {
  factories,
  wrappedRedisClient: factories.wrappedRedisClient(),
  redisClient: factories.redisClient(),
  dopplerClient: factories.dopplerClient(),
  shopifyClient: factories.shopifyClient(),
  appController: factories.appController(),
}
