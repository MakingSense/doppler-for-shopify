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

  it('should return a list of N shops when there are N shops associated to the same Doppler account', async function() {
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
        { accessToken: "fmdklsf893rnj3nrfd", dopplerApiKey: "DSJKAHDDWAIUWDNSA", dopplerAccountName: "user1@example.com", connectedOn: "2018-11-01T01:43:06.976Z" })
    )
    .onCall(1)
    .returns(
      Promise.resolve(
        { accessToken: "fdsf3rwefsdcsdv", dopplerApiKey: "DJKSUDAHSKJDSA", dopplerAccountName: "user2@example.com", connectedOn: "2018-10-01T01:43:06.976Z" })
    );

    const dopplerController = new DopplerController(
      redisClientFactoryStub
    );

    await dopplerController.getShops(request, response);

    expect(response.json).to.be.called.calledWithExactly([
      { shop: 'my-store.myshopify.com', accessToken: "fmdklsf893rnj3nrfd", connectedOn: "2018-11-01T01:43:06.976Z" },
      { shop: 'my-store-2.myshopify.com', accessToken: "fdsf3rwefsdcsdv", connectedOn: "2018-10-01T01:43:06.976Z" }
    ]);

    expect(
      modulesMocks.redisClient.getShopsAsync
    ).to.be.called.calledWithExactly('fb5d67a5bd67ab5d67ab5d', false);
  });
});
