require('dotenv').config({ path: '.env.tests' });
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const throwsAsync = require('../../test-utilities/chai-throws-async');
const mocks = require('../../test-utilities/modules-mock');
const expect = chai.expect;

const redisStub = sinon.stub();
redisStub.createClient = sinon.stub()
    .returns(mocks.wrappedRedisClient);

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

        this.sandbox.stub(mocks.wrappedRedisClient, 'hmset').callsFake((key, obj, cb) => { cb(); });
        this.sandbox.stub(mocks.wrappedRedisClient, 'quit');
        
        const redisClient = Redis.createClient()
        await redisClient.storeShopAsync('my-store.myshopify.com', { accessToken: '1234567890' })

        expect(mocks.wrappedRedisClient.hmset).to.have.been.callCount(1);
        expect(mocks.wrappedRedisClient.hmset).to.have.been.calledWith('my-store.myshopify.com', { accessToken: '1234567890' });
        expect(mocks.wrappedRedisClient.quit).to.have.been.callCount(0);
    });

    it('storeShopAsync should raise the error thrown by redis and close the connection', async function() {
        const error = new Error('Forced Error');
        this.sandbox.stub(mocks.wrappedRedisClient, 'hmset').throws(new Error('Forced Error'));
        this.sandbox.stub(mocks.wrappedRedisClient, 'quit').callsFake((cb) => { cb(); });

        const redisClient = Redis.createClient()

        await throwsAsync(async () => { await redisClient.storeShopAsync('my-store.myshopify.com', { accessToken: '1234567890' }, true) },
         'Error storing shop my-store.myshopify.com. Error: Forced Error');
        
        expect(mocks.wrappedRedisClient.quit).to.have.been.callCount(1);
    });

    it('getShopAsync should call wrapped method correctly', async function() {
        this.sandbox.stub(mocks.wrappedRedisClient, 'hgetall')
            .callsFake((key, cb) => { cb(); })
            
        this.sandbox.stub(mocks.wrappedRedisClient, 'quit');

        const redisClient = Redis.createClient();
        
        await redisClient.getShopAsync('my-store.myshopify.com')

        expect(mocks.wrappedRedisClient.hgetall).to.have.been.callCount(1);
        expect(mocks.wrappedRedisClient.hgetall).to.have.been.calledWith('my-store.myshopify.com');
        expect(mocks.wrappedRedisClient.quit).to.have.been.callCount(0);
    });

    it('getShopAsync should raise the error thrown by redis and close the connection', async function() {
        const error = new Error('Forced Error');
        this.sandbox.stub(mocks.wrappedRedisClient, 'hgetall').throws(error);
        this.sandbox.stub(mocks.wrappedRedisClient, 'quit').callsFake((cb) => { cb(); });

        const redisClient = Redis.createClient()

        await throwsAsync(async () => { await redisClient.getShopAsync('my-store.myshopify.com', true) },
        'Error retrieving shop my-store.myshopify.com. Error: Forced Error');

        expect(mocks.wrappedRedisClient.quit).to.have.been.callCount(1);
    });

    it('removeShopAsync should call wrapped method correctly', async function() {
        this.sandbox.stub(mocks.wrappedRedisClient, 'del').callsFake((key, cb) => { cb(); });
        this.sandbox.stub(mocks.wrappedRedisClient, 'quit');

        const redisClient = Redis.createClient()
        
        await redisClient.removeShopAsync('my-store.myshopify.com')

        expect(mocks.wrappedRedisClient.del).to.have.been.callCount(1);
        expect(mocks.wrappedRedisClient.del).to.have.been.calledWith('my-store.myshopify.com');
        expect(mocks.wrappedRedisClient.quit).to.have.been.callCount(0);
    });

    it('removeShopAsync should raise the error thrown by redis and close the connection', async function() {
        const error = new Error('Forced Error');
        this.sandbox.stub(mocks.wrappedRedisClient, 'del').throws(error);
        this.sandbox.stub(mocks.wrappedRedisClient, 'quit').callsFake((cb) => { cb(); });

        const redisClient = Redis.createClient()


        await throwsAsync(async () => { await redisClient.removeShopAsync('my-store.myshopify.com', true) },
        'Error removing shop my-store.myshopify.com. Error: Forced Error');

        expect(mocks.wrappedRedisClient.quit).to.have.been.callCount(1);
    });
})