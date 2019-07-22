require('dotenv').config({ path: '.env.tests' });
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const throwsAsync = require('../../test-utilities/chai-throws-async');
const mocks = require('../../test-utilities/modules-mock');
const expect = chai.expect;

const redisStub = sinon.stub();
redisStub.createClient = sinon.stub().returns(mocks.wrappedRedisClient);

const Redis = require('./redis-client')(redisStub);

describe('The redis-client module', function() {
  before(function() {
    chai.use(sinonChai);
  });

  beforeEach(function() {
    this.sandbox = sinon.createSandbox();
  });

  afterEach(function() {
    this.sandbox.restore();
  });

  it('constructor should create wrapped Redis client with correct parameters', function() {
    Redis.createClient();
    expect(redisStub.createClient).to.have.been.callCount(1);
    expect(redisStub.createClient).to.have.been.calledWith({
      host: '127.0.0.1',
      port: 6380,
      password: 'hello_world',
    });
  });


  const defaultFakes = {
    hmset: (_key, _obj, cb) => {
      cb();
    },
    sadd: (_key, _obj, cb) => {
      cb();
    },
    quit: cb => {
      cb();
    },
    hgetall: (_key, cb) => {
      cb();
    },
    del: (_key, cb) => {
      cb();
    },
    srem: (_key, _obj, cb) => {
      cb();
    },
    smembers: (_key, cb) => {
      cb();
    }
  };

  const prepareDummySandbox = (sandbox, customFakes = {}) => {
    const fakes = { ...defaultFakes, ...customFakes };
    for (var method in fakes) {
      sandbox
      .stub(mocks.wrappedRedisClient, method)
      .callsFake(fakes[method]);
    }
  }

  it('storeShopAsync should not call quit when flag is not set', async function() {
    prepareDummySandbox(this.sandbox);

    const redisClient = Redis.createClient();
    await redisClient.storeShopAsync('my-store.myshopify.com', {
      accessToken: '1234567890',
      dopplerApiKey: '0f9k409qkc09q4kf'
    });

    expect(mocks.wrappedRedisClient.quit).to.have.been.callCount(0);
  });

  it('storeShopAsync should call quit when flag is set', async function() {
    prepareDummySandbox(this.sandbox);

    const redisClient = Redis.createClient();
    await redisClient.storeShopAsync('my-store.myshopify.com', {
      accessToken: '1234567890',
      dopplerApiKey: '0f9k409qkc09q4kf'
    }, true);

    expect(mocks.wrappedRedisClient.quit).to.have.been.callCount(1);
  });

  it('storeShopAsync should store the shop with domain as key', async function() {
    prepareDummySandbox(this.sandbox);

    const redisClient = Redis.createClient();
    await redisClient.storeShopAsync('my-store.myshopify.com', {
      accessToken: '1234567890',
      dopplerApiKey: '0f9k409qkc09q4kf'
    });

    expect(mocks.wrappedRedisClient.hmset).to.have.been.callCount(1);
    expect(mocks.wrappedRedisClient.hmset).to.have.been.calledWith(
      'my-store.myshopify.com',
      { accessToken: '1234567890', dopplerApiKey: '0f9k409qkc09q4kf' }
    );
  });

  it('storeShopAsync should store the shop domain with apikey as key and with accountname as key when both are present in the shop payload', async function() {
    prepareDummySandbox(this.sandbox);

    const redisClient = Redis.createClient();
    await redisClient.storeShopAsync('my-store.myshopify.com', {
      accessToken: '1234567890',
      dopplerApiKey: '0f9k409qkc09q4kf',
      dopplerAccountName: 'my@account.com'
    });
    expect(mocks.wrappedRedisClient.sadd).to.have.been.callCount(2);
    expect(mocks.wrappedRedisClient.sadd).to.have.been.calledWith(
      'shopDomainsByDopplerApikey:0f9k409qkc09q4kf',
      'my-store.myshopify.com'
    );
    expect(mocks.wrappedRedisClient.sadd).to.have.been.calledWith(
      'shopDomainsByDopplerAccountName:my@account.com',
      'my-store.myshopify.com'
    );
  });

  it('storeShopAsync should store the shop domain with apikey as key when it is present in the shop payload', async function() {
    prepareDummySandbox(this.sandbox);

    const redisClient = Redis.createClient();
    await redisClient.storeShopAsync('my-store.myshopify.com', {
      accessToken: '1234567890',
      dopplerApiKey: '0f9k409qkc09q4kf'
    });
    expect(mocks.wrappedRedisClient.sadd).to.have.been.callCount(1);
    expect(mocks.wrappedRedisClient.sadd).to.have.been.calledWith(
      'shopDomainsByDopplerApikey:0f9k409qkc09q4kf',
      'my-store.myshopify.com'
    );
  });

  it('storeShopAsync should not store the shop domain with apikey as key when it is not present in the shop payload', async function() {
    prepareDummySandbox(this.sandbox);

    const redisClient = Redis.createClient();
    await redisClient.storeShopAsync('my-store.myshopify.com', {
      accessToken: '1234567890'
    });
    expect(mocks.wrappedRedisClient.sadd).to.have.been.callCount(0);
  });

  it('storeShopAsync should store the shop domain with accountname as key when it is present in the shop payload', async function() {
    prepareDummySandbox(this.sandbox);

    const redisClient = Redis.createClient();
    await redisClient.storeShopAsync('my-store.myshopify.com', {
      accessToken: '1234567890',
      dopplerAccountName: 'my@account.com'
    });
    expect(mocks.wrappedRedisClient.sadd).to.have.been.callCount(1);
    expect(mocks.wrappedRedisClient.sadd).to.have.been.calledWith(
      'shopDomainsByDopplerAccountName:my@account.com',
      'my-store.myshopify.com'
    );
  });

  it('storeShopAsync should not store the shop domain with accountname as key when it is not present in the shop payload', async function() {
    prepareDummySandbox(this.sandbox);

    const redisClient = Redis.createClient();
    await redisClient.storeShopAsync('my-store.myshopify.com', {
      accessToken: '1234567890'
    });
    expect(mocks.wrappedRedisClient.sadd).to.have.been.callCount(0);
  });

  it('storeShopAsync should raise the error thrown by redis and close the connection', async function() {
    const error = new Error('Forced Error');
    this.sandbox
      .stub(mocks.wrappedRedisClient, 'hmset')
      .throws(new Error('Forced Error'));
    this.sandbox.stub(mocks.wrappedRedisClient, 'quit').callsFake(cb => {
      cb();
    });

    const redisClient = Redis.createClient();

    await throwsAsync(async () => {
      await redisClient.storeShopAsync(
        'my-store.myshopify.com',
        { accessToken: '1234567890' },
        true
      );
    }, 'Error storing shop my-store.myshopify.com. Error: Forced Error');

    expect(mocks.wrappedRedisClient.quit).to.have.been.callCount(1);
  });

  it('getShopAsync should not call quit when flag is not set', async function() {
    prepareDummySandbox(this.sandbox);

    const redisClient = Redis.createClient();

    await redisClient.getShopAsync('my-store.myshopify.com');

    expect(mocks.wrappedRedisClient.quit).to.have.been.callCount(0);
  });

  it('getShopAsync should call quit when flag is set', async function() {
    prepareDummySandbox(this.sandbox);

    const redisClient = Redis.createClient();

    await redisClient.getShopAsync('my-store.myshopify.com', true);

    expect(mocks.wrappedRedisClient.quit).to.have.been.callCount(1);
  });

  it('getShopAsync should get shop if it is stored with the new key', async function() {
    const shop = {};

    prepareDummySandbox(this.sandbox, { 
      hgetall: (key, cb) => { cb(undefined, key.startsWith('shopsByShopDomain:') ? shop : null); }
    });

    const redisClient = Redis.createClient();

    const result = await redisClient.getShopAsync('my-store.myshopify.com');

    expect(mocks.wrappedRedisClient.hgetall).to.have.been.calledWith(
      'shopsByShopDomain:my-store.myshopify.com'
    );
    expect(result).to.equal(shop);
  });

  it('getShopAsync should check in old and new keys if the shop does not exist', async function() {
    prepareDummySandbox(this.sandbox);

    const redisClient = Redis.createClient();

    const result = await redisClient.getShopAsync('my-store.myshopify.com');

    expect(mocks.wrappedRedisClient.hgetall).to.have.been.callCount(2);
    expect(mocks.wrappedRedisClient.hgetall).to.have.been.calledWith(
      'shopsByShopDomain:my-store.myshopify.com'
    );
    expect(mocks.wrappedRedisClient.hgetall).to.have.been.calledWith(
      'my-store.myshopify.com'
    );
    expect(result).to.be.null;
  });

  it('getShopAsync should raise the error thrown by redis and close the connection', async function() {
    const error = new Error('Forced Error');
    this.sandbox.stub(mocks.wrappedRedisClient, 'hgetall').throws(error);
    this.sandbox.stub(mocks.wrappedRedisClient, 'quit').callsFake(cb => {
      cb();
    });

    const redisClient = Redis.createClient();

    await throwsAsync(async () => {
      await redisClient.getShopAsync('my-store.myshopify.com', true);
    }, 'Error retrieving shop my-store.myshopify.com. Error: Forced Error');

    expect(mocks.wrappedRedisClient.quit).to.have.been.callCount(1);
  });

  it('removeShopAsync should should not call quit when flag is not set', async function() {
    prepareDummySandbox(this.sandbox, {
      hgetall: (_key, cb) => { cb(null, { dopplerApiKey: 'jv8jf9a8jecdsc' }); }
    });

    const redisClient = Redis.createClient();

    await redisClient.removeShopAsync('my-store.myshopify.com');

    expect(mocks.wrappedRedisClient.quit).to.have.been.callCount(0);
  });

  it('removeShopAsync should should not call quit when flag is set', async function() {
    prepareDummySandbox(this.sandbox, {
      hgetall: (_key, cb) => { cb(null, { dopplerApiKey: 'jv8jf9a8jecdsc' }); }
    });

    const redisClient = Redis.createClient();

    await redisClient.removeShopAsync('my-store.myshopify.com', true);

    expect(mocks.wrappedRedisClient.quit).to.have.been.callCount(1);
  });

  it('removeShopAsync should delete the shop and related keys', async function() {
    const domainName = 'my-store.myshopify.com';
    const dopplerApiKey = 'apikey';
    const dopplerAccountName = 'account@name.com';
    const shop = { dopplerApiKey, dopplerAccountName };

    prepareDummySandbox(this.sandbox, {
      hgetall: (_key, cb) => { cb(null, shop); }
    });

    const redisClient = Redis.createClient();
    await redisClient.removeShopAsync(domainName);

    expect(mocks.wrappedRedisClient.del).to.have.been.callCount(2);
    expect(mocks.wrappedRedisClient.del).to.have.been.calledWith(
      `shopsByShopDomain:${domainName}`
    );
    expect(mocks.wrappedRedisClient.del).to.have.been.calledWith(
      domainName
    );
    expect(mocks.wrappedRedisClient.srem).to.have.been.calledWith(
      `shopDomainsByDopplerApikey:${dopplerApiKey}`, domainName
    );
    expect(mocks.wrappedRedisClient.srem).to.have.been.calledWith(
      `shopDomainsByDopplerAccountName:${dopplerAccountName}`, domainName
    );
  });

  it('removeShopAsync should not try to delete when the shop does not exist', async function() {
    const domainName = 'my-store.myshopify.com';

    prepareDummySandbox(this.sandbox);

    const redisClient = Redis.createClient();
    await redisClient.removeShopAsync(domainName);

    expect(mocks.wrappedRedisClient.del).to.have.been.callCount(0);
    expect(mocks.wrappedRedisClient.srem).to.have.been.callCount(0);
    expect(mocks.wrappedRedisClient.srem).to.have.been.callCount(0);
  });

  it('removeShopAsync should delete the shop and related keys (old shop version)', async function() {
    const domainName = 'my-store.myshopify.com';
    const dopplerApiKey = 'apikey';
    const dopplerAccountName = 'account@name.com';
    const shop = { dopplerApiKey, dopplerAccountName };

    prepareDummySandbox(this.sandbox, {
      hgetall: (key, cb) => { cb(null, key.startsWith('shopsByShopDomain:') ? null : shop); }
    });

    const redisClient = Redis.createClient();
    await redisClient.removeShopAsync(domainName);

    expect(mocks.wrappedRedisClient.del).to.have.been.callCount(2);
    expect(mocks.wrappedRedisClient.del).to.have.been.calledWith(domainName);
    expect(mocks.wrappedRedisClient.del).to.have.been.calledWith(`shopsByShopDomain:${domainName}`);
    expect(mocks.wrappedRedisClient.srem).to.have.been.callCount(3);
    expect(mocks.wrappedRedisClient.srem).to.have.been.calledWith(`shopDomainsByDopplerApikey:${dopplerApiKey}`, domainName);
    expect(mocks.wrappedRedisClient.srem).to.have.been.calledWith(`shopDomainsByDopplerAccountName:${dopplerAccountName}`, domainName);
    expect(mocks.wrappedRedisClient.srem).to.have.been.calledWith(`doppler:${dopplerApiKey}`, domainName);
  });

  it('removeShopAsync should raise the error thrown by redis and close the connection', async function() {
    const error = new Error('Forced Error');
    this.sandbox.stub(mocks.wrappedRedisClient, 'hgetall').callsFake((key, cb) => {
      cb(null, {
        dopplerApiKey: "ds8a7dhqdnkwjdn29"
      });
    });
    this.sandbox.stub(mocks.wrappedRedisClient, 'del').throws(error);
    this.sandbox.stub(mocks.wrappedRedisClient, 'quit').callsFake(cb => {
      cb();
    });

    const redisClient = Redis.createClient();

    await throwsAsync(async () => {
      await redisClient.removeShopAsync('my-store.myshopify.com', true);
    }, 'Error removing shop my-store.myshopify.com. Error: Forced Error');

    expect(mocks.wrappedRedisClient.quit).to.have.been.callCount(1);
  });

  it('getAllShopDomainsByDopplerApiKeyAsync should not call quit when flag is not set', async function() {
    prepareDummySandbox(this.sandbox);
    const redisClient = Redis.createClient();
    await redisClient.getAllShopDomainsByDopplerApiKeyAsync('dhnsa789dhsaiffdsfds');
    expect(mocks.wrappedRedisClient.quit).to.have.been.callCount(0);
  });

  it('getAllShopDomainsByDopplerApiKeyAsync should call quit when flag is set', async function() {
    prepareDummySandbox(this.sandbox);
    const redisClient = Redis.createClient();
    await redisClient.getAllShopDomainsByDopplerApiKeyAsync('dhnsa789dhsaiffdsfds', true);
    expect(mocks.wrappedRedisClient.quit).to.have.been.callCount(1);
  });

  it('getAllShopDomainsByDopplerApiKeyAsync should call wrapped method correctly', async function() {
    prepareDummySandbox(this.sandbox);
    const redisClient = Redis.createClient();
    await redisClient.getAllShopDomainsByDopplerApiKeyAsync('dhnsa789dhsaiffdsfds');
    expect(mocks.wrappedRedisClient.smembers).to.have.been.callCount(2);
    expect(mocks.wrappedRedisClient.smembers).to.have.been.calledWith(
      'shopDomainsByDopplerApikey:dhnsa789dhsaiffdsfds'
    );
    expect(mocks.wrappedRedisClient.smembers).to.have.been.calledWith(
      'doppler:dhnsa789dhsaiffdsfds'
    );
  });

  it('getAllShopDomainsByDopplerApiKeyAsync should return a two elements array when there are two shops for a given Doppler API key', async function() {
    const requestKey = 'dhnsa789dhsaiffdsfds';
    const domain1 = 'dominio1.com';
    const domain2 = 'dominio2.com';
    prepareDummySandbox(this.sandbox, {
      smembers: (key, cb) => { cb(
        undefined, 
        key === `shopDomainsByDopplerApikey:${requestKey}` ? [domain1, domain2]
          : key.startsWith('doppler:') ? null
          : 'dominio3.com'
        ); }
    });
    const redisClient = Redis.createClient();
    var result = await redisClient.getAllShopDomainsByDopplerApiKeyAsync(requestKey, true);
    expect(result).to.be.eql([domain1, domain2]);
  });

  it('getAllShopDomainsByDopplerApiKeyAsync should return shop domains with new and old key format', async function() {
    const requestKey = 'dhnsa789dhsaiffdsfds';
    const domain1 = 'dominio1.com';
    const domain2 = 'dominio2.com';
    const domain3 = 'dominio3.com';
    prepareDummySandbox(this.sandbox, {
      smembers: (key, cb) => { cb(
        undefined, 
        key === `shopDomainsByDopplerApikey:${requestKey}` ? [domain1, domain2] 
        : key === `doppler:${requestKey}` ? [domain3] 
        : 'dominio4.com'
        ); }
    });
    const redisClient = Redis.createClient();
    var result = await redisClient.getAllShopDomainsByDopplerApiKeyAsync(requestKey, true);
    expect(result).to.be.eql([domain1, domain2, domain3]);
  });

  it('getAllShopDomainsByDopplerApiKeyAsync should return a two elements array when there are two shops for a given Doppler API key in old format', async function() {
    const requestKey = 'dhnsa789dhsaiffdsfds';
    const domain1 = 'dominio1.com';
    const domain2 = 'dominio2.com';
    prepareDummySandbox(this.sandbox, {
      smembers: (key, cb) => { cb(
        undefined, 
        key.startsWith('shopDomainsByDopplerApikey:') ? null
          : key === `doppler:${requestKey}` ? [domain1, domain2]
          : 'dominio3.com'
        ); }
    });
    const redisClient = Redis.createClient();
    var result = await redisClient.getAllShopDomainsByDopplerApiKeyAsync(requestKey, true);
    expect(result).to.be.eql([domain1, domain2]);
  });

  it('getAllShopDomainsByDopplerApiKeyAsync should return an empty array when shops do not exist for a given Doppler API key', async function() {
    prepareDummySandbox(this.sandbox);
    const redisClient = Redis.createClient();
    var result = await redisClient.getAllShopDomainsByDopplerApiKeyAsync('dhnsa789dhsaiffdsfds', true);
    expect(result).to.be.eql([]);
    expect(mocks.wrappedRedisClient.smembers).to.have.been.callCount(2);
    expect(mocks.wrappedRedisClient.smembers).to.have.been.calledWith(
      'shopDomainsByDopplerApikey:dhnsa789dhsaiffdsfds'
    );
    expect(mocks.wrappedRedisClient.smembers).to.have.been.calledWith(
      'doppler:dhnsa789dhsaiffdsfds'
    );
    expect(mocks.wrappedRedisClient.quit).to.have.been.callCount(1);
  });

  it('getAllShopDomainsByDopplerApiKeyAsync should raise the error thrown by redis', async function() {
    const errorMessage = 'Forced Error';
    prepareDummySandbox(this.sandbox, {
      smembers: (_key, cb) => { cb(new Error(errorMessage)); }
    });

    const redisClient = Redis.createClient();

    await throwsAsync(async () => {
      await redisClient.getAllShopDomainsByDopplerApiKeyAsync('dhnsa789dhsaiffdsfds');
    }, `Error retrieving shops for Doppler account. Error: ${errorMessage}`);
  });

  it(`getAllShopDomainsByDopplerAccountNameAsync should not call quit when flag is not set`, async function() {
    prepareDummySandbox(this.sandbox);
    const redisClient = Redis.createClient();
    await redisClient.getAllShopDomainsByDopplerAccountNameAsync('email@test.com');
    expect(mocks.wrappedRedisClient.quit).to.have.been.callCount(0);
  });

  it(`getAllShopDomainsByDopplerAccountNameAsync should call quit when flag is set`, async function() {
    prepareDummySandbox(this.sandbox);
    const redisClient = Redis.createClient();
    await redisClient.getAllShopDomainsByDopplerAccountNameAsync('email@test.com', true);
    expect(mocks.wrappedRedisClient.quit).to.have.been.callCount(1);
  });

  it(`getAllShopDomainsByDopplerAccountNameAsync should call wrapped method correctly`, async function() {
    prepareDummySandbox(this.sandbox);
    const redisClient = Redis.createClient();
    await redisClient.getAllShopDomainsByDopplerAccountNameAsync('email@test.com');
    expect(mocks.wrappedRedisClient.smembers).to.have.been.callCount(1);
    expect(mocks.wrappedRedisClient.smembers).to.have.been.calledWith(
      'shopDomainsByDopplerAccountName:email@test.com'
    );
  });

  it(`getAllShopDomainsByDopplerAccountNameAsync should return a two elements array when there are two shops for a given Doppler AccountName`, async function() {
    const requestAccountName = 'email@test.com';
    const domain1 = 'dominio1.com';
    const domain2 = 'dominio2.com';
    prepareDummySandbox(this.sandbox, {
      smembers: (key, cb) => { cb(
        undefined, 
        key === `shopDomainsByDopplerAccountName:${requestAccountName}` ? [domain1, domain2]
          : 'dominio3.com'
        ); }
    });
    const redisClient = Redis.createClient();
    var result = await redisClient.getAllShopDomainsByDopplerAccountNameAsync(requestAccountName, true);
    expect(result).to.be.eql([domain1, domain2]);
  });

  it(`getAllShopDomainsByDopplerAccountNameAsync should return an empty array when shops do not exist for a given Doppler API key`, async function() {
    prepareDummySandbox(this.sandbox);
    const redisClient = Redis.createClient();
    var result = await redisClient.getAllShopDomainsByDopplerAccountNameAsync('email@test.com', true);
    expect(result).to.be.eql([]);
    expect(mocks.wrappedRedisClient.smembers).to.have.been.callCount(1);
    expect(mocks.wrappedRedisClient.smembers).to.have.been.calledWith(
      'shopDomainsByDopplerAccountName:email@test.com'
    );
    expect(mocks.wrappedRedisClient.quit).to.have.been.callCount(1);
  });

  it(`getAllShopDomainsByDopplerAccountNameAsync should raise the error thrown by redis`, async function() {
    const errorMessage = 'Forced Error';
    prepareDummySandbox(this.sandbox, {
      smembers: (_key, cb) => { cb(new Error(errorMessage)); }
    });

    const redisClient = Redis.createClient();

    await throwsAsync(async () => {
      await redisClient.getAllShopDomainsByDopplerAccountNameAsync('email@test.com');
    }, `Error retrieving shops for Doppler account. Error: ${errorMessage}`);
  });
  
  it(`getAllShopDomainsByDopplerDataAsync should search by shopDomainsByDopplerAccountName when dopplerData has accountName field`, async function() {
    const accountName = 'email@test.com';
    const domain = 'domain.com';
    prepareDummySandbox(this.sandbox, {
      smembers: (key, cb) => { cb(
        undefined, 
        key === `shopDomainsByDopplerAccountName:${accountName}` ? [ domain ] : null); }
    });
    const redisClient = Redis.createClient();
    const result = await redisClient.getAllShopDomainsByDopplerDataAsync({ accountName });
    expect(mocks.wrappedRedisClient.smembers).to.have.been.callCount(1);
    expect(result).to.be.deep.equal([ domain ]);
  });

  it(`getAllShopDomainsByDopplerDataAsync should search by shopDomainsByDopplerApikey when dopplerData has apiKey field`, async function() {
    const apiKey = '0123456789ABCDEF';
    const domain1 = 'domain1.com';
    const domain2 = 'domain2.com';
    prepareDummySandbox(this.sandbox, {
      smembers: (key, cb) => { cb(
        undefined, 
        key === `shopDomainsByDopplerApikey:${apiKey}` ? [ domain1 ] 
        : key === `doppler:${apiKey}` ? [ domain2 ] 
        : null); }
    });
    const redisClient = Redis.createClient();
    const result = await redisClient.getAllShopDomainsByDopplerDataAsync({ apiKey });
    expect(mocks.wrappedRedisClient.smembers).to.have.been.callCount(2);
    expect(result).to.be.deep.equal([ domain1, domain2 ]);
  });
});
