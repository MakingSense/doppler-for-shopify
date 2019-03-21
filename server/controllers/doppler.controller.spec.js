const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const DopplerController = require('./doppler.controller');
const sinonMock = require('sinon-express-mock');
const modulesMocks = require('../../test-utilities/modules-mock');
const expect = chai.expect;

const redisClientFactoryStub = {
  createClient: () => {
    return modulesMocks.redisClient;
  },
};

describe('The doppler controller', function() {
  before(function() {
    chai.use(sinonChai);
  });

  beforeEach(function() {
    this.sandbox = sinon.createSandbox();
  });

  afterEach(function() {
    this.sandbox.restore();
  });

  it('getShops should return a list of N shops when there are N shops associated to the same Doppler account', async function() {
    const request = sinonMock.mockReq({
      session: {
        dopplerApiKey: 'fb5d67a5bd67ab5d67ab5d'
      },
    });
    const response = sinonMock.mockRes();
    this.sandbox.stub(modulesMocks.redisClient, 'getShopsAsync').returns(
      Promise.resolve([
        'my-store.myshopify.com',
        'my-store-2.myshopify.com'
      ])
    );

    this.sandbox.stub(modulesMocks.redisClient, "getShopAsync")
    .onCall(0)
    .returns(
      Promise.resolve(
        { accessToken: "fmdklsf893rnj3nrfd", lastSynchronizationDate: "2018-11-01T01:43:05.976Z", connectedOn: "2018-11-01T01:43:06.976Z", dopplerListId: 321, synchronizationInProgress: false, synchronizedCustomersCount: 33, importTaskId: "task-321" })
    )
    .onCall(1)
    .returns(
      Promise.resolve(
        { accessToken: "fdsf3rwefsdcsdv", lastSynchronizationDate: "2018-11-01T01:43:05.976Z", connectedOn: "2018-10-01T01:43:06.976Z", dopplerListId: 123, synchronizationInProgress: true, synchronizedCustomersCount: 0, importTaskId: undefined })
    );

    const dopplerController = new DopplerController(
      redisClientFactoryStub,
      modulesMocks.appController
    );

    await dopplerController.getShops(request, response);

    expect(response.json).to.be.called.calledWithExactly([
      { 
        shopName: "my-store.myshopify.com", 
        shopifyAccessToken: "fmdklsf893rnj3nrfd", 
        connectedOn: "2018-11-01T01:43:06.976Z", 
        dopplerListId: 321, 
        syncProcessInProgress: false, 
        importedCustomersCount: 33, 
        syncProcessDopplerImportSubscribersTaskId: "task-321",
        syncProcessLastRunDate:  "2018-11-01T01:43:05.976Z"
      },
      { 
        shopName: "my-store-2.myshopify.com", 
        shopifyAccessToken: "fdsf3rwefsdcsdv", 
        connectedOn: "2018-10-01T01:43:06.976Z", 
        dopplerListId: 123, 
        syncProcessInProgress: true,
        importedCustomersCount: 0, 
        syncProcessDopplerImportSubscribersTaskId: undefined,
        syncProcessLastRunDate:  "2018-11-01T01:43:05.976Z"
      }
    ]);

    expect(
      modulesMocks.redisClient.getShopsAsync
    ).to.be.called.calledWithExactly('fb5d67a5bd67ab5d67ab5d', false);
  });

  it('synchronizeCustomers should synchronize customers using compossed controller', async function() {
    const request = sinonMock.mockReq({
      body: { shop: "my-store.myshopify.com" },
      session: { dopplerApiKey: 'fb5d67a5bd67ab5d67ab5d' }
    });
    const response = sinonMock.mockRes();

    this.sandbox.stub(modulesMocks.redisClient, "getShopAsync")
    .returns(
      Promise.resolve(
        { accessToken: "fmdklsf893rnj3nrfd", dopplerApiKey:"fb5d67a5bd67ab5d67ab5d", lastSynchronizationDate: "2018-11-01T01:43:05.976Z", connectedOn: "2018-11-01T01:43:06.976Z", dopplerListId: 321, synchronizationInProgress: false, synchronizedCustomersCount: 33, importTaskId: "task-321" })
    );
    this.sandbox.stub(modulesMocks.appController, 'synchronizeCustomers');

    const dopplerController = new DopplerController(
      redisClientFactoryStub,
      modulesMocks.appController
    );

    await dopplerController.synchronizeCustomers(request, response);

    expect(
      modulesMocks.appController.synchronizeCustomers
    ).to.be.called.calledWithExactly({ session: { shop: "my-store.myshopify.com", accessToken: "fmdklsf893rnj3nrfd" } }, response);
  });

  it('synchronizeCustomers should send 403 response when shop does not belong to doppler account', async function() {
    // Arrange
    const request = sinonMock.mockReq({
      body: { shop: "my-store.myshopify.com" },
      session: { dopplerApiKey: 'fb5d67a5bd67ab5d67ab5d' }
    });
    const response = sinonMock.mockRes();

    this.sandbox.stub(modulesMocks.redisClient, "getShopAsync")
    .returns(
      Promise.resolve(
        { accessToken: "fmdklsf893rnj3nrfd", dopplerApiKey:"aaaaaaaaaaaaaaaaaa", lastSynchronizationDate: "2018-11-01T01:43:05.976Z", connectedOn: "2018-11-01T01:43:06.976Z", dopplerListId: 321, synchronizationInProgress: false, synchronizedCustomersCount: 33, importTaskId: "task-321" })
    );

    this.sandbox.stub(modulesMocks.appController, 'synchronizeCustomers');

    const dopplerController = new DopplerController(
      redisClientFactoryStub,
      modulesMocks.appController
    );

    // Act
    await dopplerController.synchronizeCustomers(request, response);
    
    // Assert
    expect(response.sendStatus).to.be.called.calledWithExactly(403);
    expect(modulesMocks.appController.synchronizeCustomers).to.be.callCount(0);
  });

});
