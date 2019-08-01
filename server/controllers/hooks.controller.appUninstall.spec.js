const chai = require('chai');
const sinonChai = require('sinon-chai');
const HookController = require('./hooks.controller');
const sinonMock = require('sinon-express-mock');
const modulesMocks = require('../../test-utilities/modules-mock');
const expect = chai.expect;
chai.use(sinonChai);

function createBaseScenarioWithErrors() {
  const redisClient = modulesMocks.stubFactories.redisClient();
  const redisClientFactory = {
    createClient: () => redisClient,
  };
  redisClient.getShopAsync
    .throws(() => new Error('`redisClient.getShopAsync` called with unexpected parameters'));
  redisClient.removeShopAsync
    .throws(() => new Error('`redisClient.removeShopAsync` called with unexpected parameters'));

  const dopplerClient = modulesMocks.stubFactories.dopplerClient();
  const dopplerClientFactory = {
    createClient: () => { },
  };
  modulesMocks.stubObject(dopplerClientFactory);
  dopplerClientFactory.createClient
    .throws(() => new Error('`dopplerClientFactory.createClient` called with unexpected parameters'));

  return {
    redisClientFactory,
    redisClient,
    dopplerClientFactory,
    dopplerClient,
  }
}

function createDataFixture() {
  return { 
    shopDomain: 'store.myshopify.com', 
    dopplerAccountName: 'doppleraccountname@test', 
    dopplerApiKey: 'dopplerApiKey',
  };
}

function setupGetShop(
  { redisClient },
  { shopDomain, dopplerAccountName, dopplerApiKey },
) {
  const shop = { dopplerAccountName, dopplerApiKey };
  redisClient.getShopAsync.withArgs(shopDomain).returns(shop);
}


function setupDopplerClientFactory(
  { dopplerClientFactory, dopplerClient },
  { dopplerAccountName, dopplerApiKey },
) {
  dopplerClientFactory.createClient.withArgs(dopplerAccountName, dopplerApiKey).returns(dopplerClient);
}

function setupRemoveShop(
  { redisClient },
  { shopDomain },
) {
  redisClient.removeShopAsync.withArgs(shopDomain).resolves(true);
}

function setupHappyPathScenario(scenario, fixture) {
  setupGetShop(scenario, fixture);
  setupDopplerClientFactory(scenario, fixture);
  setupRemoveShop(scenario, fixture);
};

describe('appUninstall in hooks.controller', () => {
  it('should remove redis entries when all data is consistent and there are no errors', async () => {
    // Arrange
    const scenario = createBaseScenarioWithErrors();
    const fixture = createDataFixture();
    setupHappyPathScenario(scenario, fixture);
    const { redisClientFactory,  redisClient, dopplerClientFactory } = scenario;
    const { shopDomain } = fixture;
    
    const hooksController = new HookController(
      redisClientFactory,
      dopplerClientFactory,
      null);

    const request = sinonMock.mockReq({ webhook: { shopDomain } });

    // Act
    await hooksController.appUninstalled(undefined, request);
  
    // Assert
    expect(redisClient.removeShopAsync).to.have.been.calledWithExactly(shopDomain);
  });

  it('should try to remove redis entries even when all the rest fails', async () => {
    // Arrange
    const {
      redisClientFactory,
      redisClient,
      dopplerClientFactory,
    } = createBaseScenarioWithErrors();
    const fixture = createDataFixture();
    const { shopDomain } = fixture;

    const hooksController = new HookController(
      redisClientFactory,
      dopplerClientFactory,
      null);

    const request = sinonMock.mockReq({ webhook: { shopDomain } });

    // Act
    await hooksController.appUninstalled(undefined, request);
  
    // Assert
    expect(redisClient.removeShopAsync).to.have.been.calledWithExactly(shopDomain);
  });

  it('should remove Doppler Integration entries when all data is consistent and there are no errors', async () => {
    // Arrange
    const scenario = createBaseScenarioWithErrors();
    const fixture = createDataFixture();
    setupHappyPathScenario(scenario, fixture);
    const { redisClientFactory,  dopplerClientFactory, dopplerClient } = scenario;
    const { shopDomain, dopplerAccountName, dopplerApiKey } = fixture;

    const hooksController = new HookController(
      redisClientFactory,
      dopplerClientFactory,
      dopplerClient,
      null);

    const request = sinonMock.mockReq({ webhook: { shopDomain } });

    // Act
    await hooksController.appUninstalled(undefined, request);
  
    // Assert
    expect(dopplerClientFactory.createClient).to.have.been.calledWithExactly(dopplerAccountName, dopplerApiKey);
    expect(dopplerClient.deleteShopifyIntegrationAsync).to.have.been.called;
  });

  it('should try to remove Doppler Integration entries even when redisClient.removeShopAsync fails', async () => {
    // Arrange
    const scenario = createBaseScenarioWithErrors();
    const fixture = createDataFixture();

    setupDopplerClientFactory(scenario, fixture);
    setupGetShop(scenario, fixture);
    // Omitting setupRemoveShop on purpose to ensure to have an exception

    const {
      redisClientFactory,
      dopplerClientFactory,
      dopplerClient,
    } = scenario;
    const { shopDomain, dopplerAccountName, dopplerApiKey } = fixture;

    const hooksController = new HookController(
      redisClientFactory,
      dopplerClientFactory,
      null);

    const request = sinonMock.mockReq({ webhook: { shopDomain } });

    // Act
    await hooksController.appUninstalled(undefined, request);
  
    // Assert
    expect(dopplerClientFactory.createClient).to.have.been.calledWithExactly(dopplerAccountName, dopplerApiKey);
    expect(dopplerClient.deleteShopifyIntegrationAsync).to.have.been.called;
  });

  it('should not perform any operation when the input is an error', async function() {
    // Arrange
    const {
      redisClientFactory,
      redisClient,
      dopplerClientFactory,
      dopplerClient,
    } = createBaseScenarioWithErrors();
    const { shopDomain } = createDataFixture();

    const hooksController = new HookController(
      redisClientFactory,
      dopplerClientFactory,
      null);

    const request = sinonMock.mockReq({ webhook: { shopDomain } });
    const error = new Error('Forced Error');

    // Act
    await hooksController.appUninstalled(error, request);
  
    // Assert
    expect(redisClient.getShopAsync).to.have.not.been.called;
    expect(dopplerClientFactory.createClient).to.have.not.been.called;
    expect(dopplerClient.deleteShopifyIntegrationAsync).to.have.not.been.called;
  });

})
