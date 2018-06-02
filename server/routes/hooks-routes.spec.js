const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const HookRoutes = require('./hooks-routes');
const sinonMock = require('sinon-express-mock');
const modulesMocks = require('../../test-utilities/modules-mock');
const expect = chai.expect;

const redisClientFactoryStub = { createClient: () => { return modulesMocks.redisClient; }};
const dopplerClientFactoryStub = { createClient: () => { return modulesMocks.dopplerClient; }};
const shopifyClientFactoryStub = { createClient: () => { return modulesMocks.shopifyClient; }};

describe('The hooks routes', function () {

    before(function () {
        chai.use(sinonChai);
    });
    
    beforeEach(function () {
        this.sandbox = sinon.createSandbox();
    });
    
    afterEach(function () {
        this.sandbox.restore();
    });

    it('appUninstalled should remove the data of the application', async function(){
        const request = sinonMock.mockReq({ webhook: { shopDomain: 'store.myshopify.com' } });

        this.sandbox.stub(modulesMocks.redisClient, 'removeShopAsync');

        const appRoutes = new HookRoutes(redisClientFactoryStub, dopplerClientFactoryStub, shopifyClientFactoryStub);
        await appRoutes.appUninstalled(undefined, request);
        
        expect(modulesMocks.redisClient.removeShopAsync).to.be.calledWithExactly('store.myshopify.com', true);
    });

    it('appUninstalled should not perform any operation when there is an error', async function(){
        const request = sinonMock.mockReq();
        this.sandbox.stub(modulesMocks.redisClient, 'removeShopAsync');

        const appRoutes = new HookRoutes(redisClientFactoryStub, dopplerClientFactoryStub, shopifyClientFactoryStub);
        await appRoutes.appUninstalled(new Error('Forced Error'), request);
        
        expect(modulesMocks.redisClient.removeShopAsync).to.have.been.callCount(0);
    });

    it('customerCreated create a subscriber in Doppler', async function(){
        const request = sinonMock.mockReq({ webhook: { shopDomain: 'store.myshopify.com' }, body: '{"id":623558295613,"email":"jonsnow@example.com","first_name":"Jon","last_name":"Snow","default_address":{"company":"Winterfell"}}' });
        
        this.sandbox.stub(modulesMocks.redisClient, 'getShopAsync')
            .returns(Promise.resolve({
                accessToken: 'ae768b8c78d68a54565434',
                dopplerApiKey: 'C22CADA13759DB9BBDF93B9D87C14D5A', 
                dopplerAccountName: 'user@example.com',
                dopplerListId: 1456877,
                fieldsMapping: '[{"shopify":"first_name","doppler":"FIRSTNAME"},{"shopify":"last_name","doppler":"LASTNAME"}]'
            }));
        this.sandbox.stub(modulesMocks.dopplerClient, 'createSubscriberAsync');

        const appRoutes = new HookRoutes(redisClientFactoryStub, dopplerClientFactoryStub, shopifyClientFactoryStub);
        await appRoutes.customerCreated(undefined, request);
        
        expect(modulesMocks.redisClient.getShopAsync).to.be.calledWithExactly('store.myshopify.com', true);
        expect(modulesMocks.dopplerClient.createSubscriberAsync).to.be.calledWithExactly({
            default_address: { company: "Winterfell" },
            email: "jonsnow@example.com",
            first_name: "Jon",
            id: 623558295613,
            last_name: "Snow"
          }, 1456877, [{ doppler: "FIRSTNAME", shopify: "first_name" }, { doppler: "LASTNAME", shopify: "last_name" }]);
    });
    
    it('customerCreated should not perform any operation when there is an error', async function(){
        const request = sinonMock.mockReq();
        this.sandbox.stub(modulesMocks.redisClient, 'getShopAsync')
        this.sandbox.stub(modulesMocks.dopplerClient, 'createSubscriberAsync');

        const appRoutes = new HookRoutes(redisClientFactoryStub, dopplerClientFactoryStub, shopifyClientFactoryStub);
        await appRoutes.customerCreated(new Error('Forced Error'), request);
        
        expect(modulesMocks.redisClient.getShopAsync).have.been.callCount(0);
        expect(modulesMocks.dopplerClient.createSubscriberAsync).have.been.callCount(0);
    });

    it('customerCreated should not perform any operation when there is not a Doppler list set', async function(){
        const request = sinonMock.mockReq({ webhook: { shopDomain: 'store.myshopify.com' }, body: '{"id":623558295613,"email":"jonsnow@example.com","first_name":"Jon","last_name":"Snow","default_address":{"company":"Winterfell"}}' });

        this.sandbox.stub(modulesMocks.redisClient, 'getShopAsync')
            .returns(Promise.resolve({
                accessToken: 'ae768b8c78d68a54565434',
                dopplerApiKey: 'C22CADA13759DB9BBDF93B9D87C14D5A', 
                dopplerAccountName: 'user@example.com',
                dopplerListId: null,
                fieldsMapping: '[{"shopify":"first_name","doppler":"FIRSTNAME"},{"shopify":"last_name","doppler":"LASTNAME"}]'
            }));
        this.sandbox.stub(modulesMocks.dopplerClient, 'createSubscriberAsync');

        const appRoutes = new HookRoutes(redisClientFactoryStub, dopplerClientFactoryStub, shopifyClientFactoryStub);
        await appRoutes.customerCreated(undefined, request);
        
        expect(modulesMocks.redisClient.getShopAsync).to.be.calledWithExactly('store.myshopify.com', true);
        expect(modulesMocks.dopplerClient.createSubscriberAsync).to.have.been.callCount(0);
    });

    it('customerCreated should not perform any operation when there is not a shop stored in Redis', async function(){
        const request = sinonMock.mockReq({ webhook: { shopDomain: 'store.myshopify.com' }, body: '{"id":623558295613,"email":"jonsnow@example.com","first_name":"Jon","last_name":"Snow","default_address":{"company":"Winterfell"}}' });
        this.sandbox.stub(modulesMocks.redisClient, 'getShopAsync')
            .returns(Promise.resolve(null));
        this.sandbox.stub(modulesMocks.dopplerClient, 'createSubscriberAsync');

        const appRoutes = new HookRoutes(redisClientFactoryStub, dopplerClientFactoryStub, shopifyClientFactoryStub);
        await appRoutes.customerCreated(undefined, request);
        
        expect(modulesMocks.redisClient.getShopAsync).to.be.calledWithExactly('store.myshopify.com', true);
        expect(modulesMocks.dopplerClient.createSubscriberAsync).to.have.been.callCount(0);
    });

    it('dopplerImportTaskCompleted should set the synchronization status correctly', async function(){
        const request = sinonMock.mockReq({ query: { shop: 'store.myshopify.com' } });
        const response = sinonMock.mockRes();
        this.sandbox.stub(modulesMocks.redisClient, 'storeShopAsync');

        const appRoutes = new HookRoutes(redisClientFactoryStub, dopplerClientFactoryStub, shopifyClientFactoryStub);
        await appRoutes.dopplerImportTaskCompleted(request, response);
        
        expect(modulesMocks.redisClient.storeShopAsync).to.be.calledWithExactly('store.myshopify.com', { synchronizationInProgress: false }, true);
    });
});