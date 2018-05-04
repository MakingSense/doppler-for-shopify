require('dotenv').config({ path: '.env.tests' });
const redis = require('redis');
const Redis = require('./redis-client');
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

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

        const createClientStub = this.sandbox.stub(redis, 'createClient')
            .returns(this.sandbox.createStubInstance(redis.RedisClient));

        const redisClient = new Redis();

        expect(createClientStub).to.have.been.callCount(1);
        expect(createClientStub).to.have.been.calledWith({host: '127.0.0.1', port: 6380, password: 'hello_world'});
    });

    it('storeShop should call wrapped method correctly', async function() {

        const hmsetStub = this.sandbox.stub(redis.RedisClient.prototype, "hmset")
            .callsFake((key, obj, cb) => {
                cb();
            });

        const quitStub = this.sandbox.stub(redis.RedisClient.prototype, "quit");

        this.sandbox.stub(redis, 'createClient')
            .returns(new redis.RedisClient({}));

        const redisClient = new Redis();
        
        await redisClient.storeShop('my-store.myshopify.com', { accessToken: '1234567890' })

        expect(hmsetStub).to.have.been.callCount(1);
        expect(hmsetStub).to.have.been.calledWith('my-store.myshopify.com', { accessToken: '1234567890' });
        expect(quitStub).to.have.been.callCount(0);
    });

    it('storeShop should raise the error thrown by redis and close the connection', async function() {

        const error = new Error('Forced Error');
        const hmsetStub = this.sandbox.stub(redis.RedisClient.prototype, "hmset")
            .throws(error);
        const quitStub = this.sandbox.stub(redis.RedisClient.prototype, "quit")
            .callsFake((cb) => {
                cb();
            });

        this.sandbox.stub(redis, 'createClient')
            .returns(new redis.RedisClient({}));

        const redisClient = new Redis();

        try {
            await redisClient.storeShop('my-store.myshopify.com', { accessToken: '1234567890' }, true)
        } catch (err) {
            expect(err).to.to.eql(error);
        }

        expect(quitStub).to.have.been.callCount(1);
    });

    it('getShop should call wrapped method correctly', async function() {

        const hgetallStub = this.sandbox.stub(redis.RedisClient.prototype, "hgetall")
            .callsFake((key, cb) => {
                cb();
            })

        const quitStub = this.sandbox.stub(redis.RedisClient.prototype, "quit");

        this.sandbox.stub(redis, 'createClient')
            .returns(new redis.RedisClient({}));

        const redisClient = new Redis();
        
        await redisClient.getShop('my-store.myshopify.com')

        expect(hgetallStub).to.have.been.callCount(1);
        expect(hgetallStub).to.have.been.calledWith('my-store.myshopify.com');
        expect(quitStub).to.have.been.callCount(0);
    });

    it('getShop should raise the error thrown by redis and close the connection', async function() {

        const error = new Error('Forced Error');
        const hgetallStub = this.sandbox.stub(redis.RedisClient.prototype, "hgetall")
            .throws(error);
        const quitStub = this.sandbox.stub(redis.RedisClient.prototype, "quit")
            .callsFake((cb) => {
                cb();
            });

        this.sandbox.stub(redis, 'createClient')
            .returns(new redis.RedisClient({}));

        const redisClient = new Redis();

        try {
            await redisClient.getShop('my-store.myshopify.com', true);
        } catch (err) {
            expect(err).to.to.eql(error);
        }

        expect(quitStub).to.have.been.callCount(1);
    });

    it('removeShop should call wrapped method correctly', async function() {

        const delStub = this.sandbox.stub(redis.RedisClient.prototype, "del")
            .callsFake((key, cb) => {
                cb();
            })

        const quitStub = this.sandbox.stub(redis.RedisClient.prototype, "quit");

        this.sandbox.stub(redis, 'createClient')
            .returns(new redis.RedisClient({}));

        const redisClient = new Redis();
        
        await redisClient.removeShop('my-store.myshopify.com')

        expect(delStub).to.have.been.callCount(1);
        expect(delStub).to.have.been.calledWith('my-store.myshopify.com');
        expect(quitStub).to.have.been.callCount(0);
    });

    it('removeShop should raise the error thrown by redis and close the connection', async function() {

        const error = new Error('Forced Error');
        const delStub = this.sandbox.stub(redis.RedisClient.prototype, "del")
            .throws(error);
        const quitStub = this.sandbox.stub(redis.RedisClient.prototype, "quit")
            .callsFake((cb) => {
                cb();
            });

        this.sandbox.stub(redis, 'createClient')
            .returns(new redis.RedisClient({}));

        const redisClient = new Redis();

        try {
            await redisClient.removeShop('my-store.myshopify.com', true);
        } catch (err) {
            expect(err).to.to.eql(error);
        }

        expect(quitStub).to.have.been.callCount(1);
    });
})