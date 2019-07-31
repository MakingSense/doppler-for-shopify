const sinon = require('sinon');

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

const stubObject = obj => {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop) && obj[prop] instanceof Function) {
      sinon.stub(obj, prop);
    }
  }
};

const stubFactories = Object.keys(factories).reduce((resultFactories, factoryName) => {
  resultFactories[factoryName] = () => {
    const obj = factories[factoryName]();
    stubObject(obj);
    return obj;
  }
  return resultFactories;
}, {});

module.exports = {
  factories,
  stubFactories,
  stubObject,
  wrappedRedisClient: factories.wrappedRedisClient(),
  redisClient: factories.redisClient(),
  dopplerClient: factories.dopplerClient(),
  shopifyClient: factories.shopifyClient(),
  appController: factories.appController(),
}
