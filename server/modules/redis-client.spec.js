require('dotenv').config({ path: '.env.tests' });
const redis = require('redis');
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const throwsAsync = require('../../test-utilities/chai-throws-async');
const expect = chai.expect;

const wrappedClient = new redis.RedisClient({});

const redisStub = sinon.stub();
redisStub.createClient = sinon.stub()
    .returns(wrappedClient);

const Redis = require('./redis-client')(redisStub)

describe('The redis-client module', function () {
    before(function () {
        chai.use(sinonChai);
    })

    beforeEach(function () {
        this.sandbox = sinon.createSandbox();
    })

    afterEach(function () {
        this.sandbox.restore();
    })    

    it('constructor should create wrapped Redis client with correct parameters', function () {

        const redisClient = Redis.createClient();

        expect(redisStub.createClient).to.have.been.callCount(1);
        expect(redisStub.createClient).to.have.been.calledWith({host: '127.0.0.1', port: 6380, password: 'hello_world'});
    });

    it('storeShopAsync should call wrapped method correctly', async function() {

        this.sandbox.stub(wrappedClient, 'hmset').callsFake((key, obj, cb) => { cb(); });
        this.sandbox.stub(wrappedClient, 'quit');
        
        const redisClient = Redis.createClient()
        await redisClient.storeShopAsync('my-store.myshopify.com', { accessToken: '1234567890' })

        expect(wrappedClient.hmset).to.have.been.callCount(1);
        expect(wrappedClient.hmset).to.have.been.calledWith('my-store.myshopify.com', { accessToken: '1234567890' });
        expect(wrappedClient.quit).to.have.been.callCount(0);
    });

    it('storeShopAsync should raise the error thrown by redis and close the connection', async function() {
        const error = new Error('Forced Error');
        this.sandbox.stub(wrappedClient, 'hmset').throws(new Error('Forced Error'));
        this.sandbox.stub(wrappedClient, 'quit').callsFake((cb) => { cb(); });

        const redisClient = Redis.createClient()

        await throwsAsync(async () => { await redisClient.storeShopAsync('my-store.myshopify.com', { accessToken: '1234567890' }, true) },
         'Error storing shop my-store.myshopify.com. Error: Forced Error');
        
        expect(wrappedClient.quit).to.have.been.callCount(1);
    });

    it('getShopAsync should call wrapped method correctly', async function() {
        this.sandbox.stub(wrappedClient, 'hgetall').callsFake((key, cb) => { cb(); });
        this.sandbox.stub(wrappedClient, 'quit');

        const redisClient = Redis.createClient();
        
        await redisClient.getShopAsync('my-store.myshopify.com')

        expect(wrappedClient.hgetall).to.have.been.callCount(1);
        expect(wrappedClient.hgetall).to.have.been.calledWith('my-store.myshopify.com');
        expect(wrappedClient.quit).to.have.been.callCount(0);
    });

    it('getShopAsync should raise the error thrown by redis and close the connection', async function() {
        const error = new Error('Forced Error');
        this.sandbox.stub(wrappedClient, 'hgetall').throws(error);
        this.sandbox.stub(wrappedClient, 'quit').callsFake((cb) => { cb(); });

        const redisClient = Redis.createClient()

        await throwsAsync(async () => { await redisClient.getShopAsync('my-store.myshopify.com', true) },
        'Error retrieving shop my-store.myshopify.com. Error: Forced Error');

        expect(wrappedClient.quit).to.have.been.callCount(1);
    });

    it('removeShopAsync should call wrapped method correctly', async function() {
        this.sandbox.stub(wrappedClient, 'del').callsFake((key, cb) => { cb(); });
        this.sandbox.stub(wrappedClient, 'quit');

        const redisClient = Redis.createClient()
        
        await redisClient.removeShopAsync('my-store.myshopify.com')

        expect(wrappedClient.del).to.have.been.callCount(1);
        expect(wrappedClient.del).to.have.been.calledWith('my-store.myshopify.com');
        expect(wrappedClient.quit).to.have.been.callCount(0);
    });

    it('removeShopAsync should raise the error thrown by redis and close the connection', async function() {
        const error = new Error('Forced Error');
        this.sandbox.stub(wrappedClient, 'del').throws(error);
        this.sandbox.stub(wrappedClient, 'quit').callsFake((cb) => { cb(); });

        const redisClient = Redis.createClient()


        await throwsAsync(async () => { await redisClient.removeShopAsync('my-store.myshopify.com', true) },
        'Error removing shop my-store.myshopify.com. Error: Forced Error');

        expect(wrappedClient.quit).to.have.been.callCount(1);
    });
})