const request = require('supertest');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const mocks = require('../test-utilities/modules-mock');
const dopplerApiResponses = require('../test-utilities/doppler-api-responses');
const dopplerApiPayloads = require('../test-utilities/doppler-api-payloads');
const querystring = require('querystring');
const crypto = require('crypto');
const expect = chai.expect;

const accessToken = 'a1b2c3d4e5f6';
const shopDomain = 'store.myshopify.com';
const dopplerAccountName = 'user@example.com';
const dopplerApiKey = 'C22CADA13759DB9BBDF93B9D87C14D5A';
const dopplerListId = 17465;
const fieldsMapping = JSON.stringify([
  {
    doppler: 'FIRSTNAME',
    shopify: 'first_name',
  },
  {
    doppler: 'LASTNAME',
    shopify: 'last_name',
  },
  {
    doppler: 'Empresa',
    shopify: 'default_address.company',
  },
]);

const redisStub = sinon.stub();
redisStub.createClient = sinon.stub().returns(mocks.wrappedRedisClient);
redisStub['@global'] = true;

const fetchStub = sinon.stub();
fetchStub['@global'] = true;

const gotStub = sinon.stub();
gotStub['@global'] = true;

const app = proxyquire('./', {
  dotenv: require('dotenv').config({ path: '.env.tests' }), // Fake the environmnent settings.
  'node-fetch': fetchStub, // Fake the http requests made by Doppler and others.
  redis: redisStub, // Fake the database.
  got: gotStub, //  Fake the http requests made by Shopify API client.
  'connect-redis': () => {
    return undefined;
  },
});

let cookie = null;

describe('Server integration tests', function() {
  before(function() {
    chai.use(sinonChai);
  });

  beforeEach(function() {
    this.sandbox = sinon.createSandbox();
    this.sandbox.stub(mocks.wrappedRedisClient, 'quit').callsFake(cb => {
      cb();
    });
    this.sandbox
      .stub(mocks.wrappedRedisClient, 'hmset')
      .callsFake((_key, _obj, cb) => {
        cb();
      });
    this.sandbox
      .stub(mocks.wrappedRedisClient, 'sadd')
      .callsFake((_key, _obj, cb) => {
        cb();
      });
    this.sandbox
      .stub(mocks.wrappedRedisClient, 'smembers')
      .callsFake((_key, cb) => {
        cb();
      });
    this.sandbox.stub(mocks.wrappedRedisClient, 'del').callsFake((_key, cb) => {
      cb();
    });
  });

  afterEach(function() {
    this.sandbox.restore();
  });

  it('Should return 302 status code for invalid URL', async function() {
    await request(app)
      .get(`/foo/bar`)
      .expect(function(res) {
        expect(res.statusCode).to.be.eql(302);
      });
  });

  describe('GET /shopify/auth/callback', function() {
    it('Should generate the session cookie with the access token', async function() {
      const requestBody = querystring.stringify({
        code: '1234567890',
        client_id: process.env.SHOPIFY_APP_KEY,
        client_secret: process.env.SHOPIFY_APP_SECRET,
      });

      fetchStub
        .withArgs(`https://${shopDomain}/admin/oauth/access_token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(requestBody),
          },
          body: requestBody,
        })
        .returns(
          Promise.resolve({
            status: 200,
            json: async function() {
              return { access_token: 'a1b2c3d4e5f6' };
            },
          })
        );

      gotStub.returns(
        Promise.resolve({
          headers: { 'x-shopify-shop-api-call-limit': '1/9999' },
          body: {},
        })
      );

      const message = `code=1234567890&shop=${
        shopDomain
      }&timestamp=${new Date().getTime()}`;
      const generated_hash = crypto
        .createHmac('sha256', process.env.SHOPIFY_APP_SECRET)
        .update(message)
        .digest('hex');

      await request(app)
        .get(`/shopify/auth/callback?${message}&hmac=${generated_hash}`)
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(302);
          expect(res.headers.location).to.be.eql('/');
          cookie = res.get('set-cookie');
          expect(cookie.length).to.be.eql(1);
          expect(cookie[0]).to.match(/connect\.sid=[^;]+; Path=\/; HttpOnly; Secure; SameSite=None/);
        });
    });
  });

  describe('GET /', function() {
    it('Should redirect to "shopify/auth?shop={shop}" when session does not exist and shop is passed as parameter', async function() {
      await request(app)
        .get(`/?shop=${shopDomain}`)
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(302);
          expect(res.headers.location).to.be.eql(
            `/shopify/auth?shop=${shopDomain}`
          );
        });
    });

    it('Should redirect to "/install" when there is not cookie session or shop parameter', async function() {
      await request(app)
        .get('/')
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(302);
          expect(res.headers.location).to.be.eql('/install');
        });
    });

    it('Should render the home page when there is an existing session', async function() {
      this.sandbox
        .stub(mocks.wrappedRedisClient, 'hgetall')
        .callsFake((_key, cb) => {
          cb(null, {
            accessToken: accessToken,
            dopplerAccountName: dopplerAccountName,
          });
        });

      await request(app)
        .get('/')
        .set('cookie', cookie)
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(200);
        });
    });

    it('Should redirect to /shopify/auth?shop={shop} when access token has changed', async function() {
      this.sandbox
        .stub(mocks.wrappedRedisClient, 'hgetall')
        .callsFake((_key, cb) => {
          cb(null, {
            accessToken: '111111111111',
            dopplerAccountName: dopplerAccountName,
          });
        });

      await request(app)
        .get('/')
        .set('cookie', cookie)
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(302);
          expect(res.headers.location).to.be.eql(
            `/shopify/auth?shop=${shopDomain}`
          );
        });
    });
  });

  describe('POST /connect-to-doppler', function() {
    it('Should return 401 status code when invalid Doppler credentials', async function() {
      fetchStub
        .withArgs(
          `https://restapi.fromdoppler.com/accounts/${querystring.escape(
            dopplerAccountName
          )}`,
          {
            headers: { Authorization: 'token AAAAAAAAAAAAAAAAAA' },
          }
        )
        .returns(
          Promise.resolve({
            status: 401,
            json: async function() {
              return dopplerApiResponses.INVALID_TOKEN_401;
            },
          })
        );

      await request(app)
        .post('/connect-to-doppler')
        .send({ dopplerAccountName, dopplerApiKey: 'AAAAAAAAAAAAAAAAAA' })
        .set('cookie', cookie)
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(401);
        });
    });

    it('Should return 200 status code when valid Doppler credentials', async function() {
      this.sandbox
      .stub(mocks.wrappedRedisClient, 'hgetall')
      .callsFake((_key, cb) => {
        cb(null, {
          accessToken: accessToken,
          dopplerAccountName: dopplerAccountName,
        });
      });
      fetchStub
        .withArgs(
          `https://restapi.fromdoppler.com/accounts/${querystring.escape(
            dopplerAccountName
          )}`,
          {
            headers: { Authorization: `token ${dopplerApiKey}` },
          }
        )
        .returns(
          Promise.resolve({
            status: 200,
            json: async function() {
              return dopplerApiResponses.HOME_200;
            },
          })
        );
      fetchStub
        .withArgs(
          `https://restapi.fromdoppler.com/accounts/${querystring.escape(
            dopplerAccountName
          )}/integrations/shopify`,
          {
            body: JSON.stringify({
              accessToken: accessToken,
              accountName: shopDomain
            }),
            method: 'PUT',
            headers: { Authorization: `token ${dopplerApiKey}` },
          }
        )
        .returns(
          Promise.resolve({
            status: 200,
            json: async function() {
              return dopplerApiResponses.INTEGRATION_UPDATED_200;
            },
          })
        );

        await request(app)
        .post('/connect-to-doppler')
        .send({ dopplerAccountName, dopplerApiKey })
        .set('cookie', cookie)
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(200);
        });
    });

    it('Should return 500 status code when server crashes calling Doppler API', async function() {
      fetchStub
        .withArgs(
          `https://restapi.fromdoppler.com/accounts/${querystring.escape(
            dopplerAccountName
          )}`,
          {
            headers: { Authorization: `token ${dopplerApiKey}` },
          }
        )
        .throws(new Error('Forced Error'));

      await request(app)
        .post('/connect-to-doppler')
        .send({ dopplerAccountName, dopplerApiKey })
        .set('cookie', cookie)
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(500);
        });
    });
  });

  describe('GET /doppler-lists', function() {
    it('Should return the Doppler lists correctly', async function() {
      this.sandbox
        .stub(mocks.wrappedRedisClient, 'hgetall')
        .callsFake((_key, cb) => {
          cb(null, { accessToken, dopplerAccountName, dopplerApiKey, dopplerListId });
        });

      fetchStub
        .withArgs(
          `https://restapi.fromdoppler.com/accounts/${querystring.escape(
            dopplerAccountName
          )}/lists?page=1&per_page=200&state=active`,
          {
            headers: { Authorization: `token ${dopplerApiKey}` },
          }
        )
        .returns(
          Promise.resolve({
            status: 200,
            json: async function() {
              return dopplerApiResponses.LISTS_PAGE_RESULT_200;
            },
          })
        );

      await request(app)
        .get('/doppler-lists')
        .set('cookie', cookie)
        .expect(function(res) {
          expect(res.text).to.be.eql(
            '{"items":[{"listId":1459381,"name":"shopify"},{"listId":1222381,"name":"marketing"},{"listId":1170501,"name":"development"}],"itemsCount":3}');
          expect(200).to.be.eql(res.statusCode);
        });
    });

    it('Should return 500 status code when there is not a Doppler API key', async function() {
      this.sandbox
        .stub(mocks.wrappedRedisClient, 'hgetall')
        .callsFake((_key, cb) => {
          cb(null, { accessToken });
        });

      await request(app)
        .get('/doppler-lists')
        .set('cookie', cookie)
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(500);
        });
    });
  });

  describe('POST /create-doppler-list', function() {
    it('Should create the Doppler list correctly', async function() {
      fetchStub
        .withArgs(
          `https://restapi.fromdoppler.com/accounts/${querystring.escape(
            dopplerAccountName
          )}/lists`,
          {
            body: '{"name":"Fresh List"}',
            method: 'POST',
            headers: { Authorization: `token ${dopplerApiKey}` },
          }
        )
        .returns(
          Promise.resolve({
            status: 201,
            json: async function() {
              return dopplerApiResponses.LIST_CREATED_201;
            },
          })
        );

      this.sandbox
        .stub(mocks.wrappedRedisClient, 'hgetall')
        .callsFake((_key, cb) => {
          cb(null, { accessToken, dopplerAccountName, dopplerApiKey });
        });

      await request(app)
        .post('/create-doppler-list')
        .send({ name: 'Fresh List' })
        .set('cookie', cookie)
        .expect(function(res) {
          expect(res.body).to.be.eql({ listId: '1462409' });
          expect(res.statusCode).to.be.eql(201);
        });
    });

    it('Should return 500 status code when there is not a Doppler API key', async function() {
      this.sandbox
        .stub(mocks.wrappedRedisClient, 'hgetall')
        .callsFake((_key, cb) => {
          cb(null, { accessToken });
        });

      await request(app)
        .post('/create-doppler-list')
        .send({ name: 'Fresh List' })
        .set('cookie', cookie)
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(500);
        });
    });
  });

  describe('POST /doppler-list', function() {
    it('Should return 200 status code on success', async function() {
      await request(app)
        .post('/doppler-list')
        .send({ dopplerListId })
        .set('cookie', cookie)
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(200);
        });
    });
  });

  describe('GET /fields', function() {
    it('Should return the Doppler fields correctly', async function() {
      fetchStub
        .withArgs(
          `https://restapi.fromdoppler.com/accounts/${querystring.escape(
            dopplerAccountName
          )}/fields`,
          { headers: { Authorization: `token ${dopplerApiKey}` } }
        )
        .returns(
          Promise.resolve({
            status: 201,
            json: async function() {
              return dopplerApiResponses.FIELDS_RESULT_200;
            },
          })
        );

      this.sandbox
        .stub(mocks.wrappedRedisClient, 'hgetall')
        .callsFake((_key, cb) => {
          cb(null, { accessToken, dopplerAccountName, dopplerApiKey });
        });

      await request(app)
        .get('/fields')
        .set('cookie', cookie)
        .expect(function(res) {
          expect(res.text.length).to.be.gt(0);
          expect(res.statusCode).to.be.eql(200);
        });
    });

    it('Should return the same ETag when the content does not change and different when the content changes', async function() {
      const dopplerApiResponse = {
        items: [
            {
              name: "presupuesto",
              predefined: false,
              private: true,
              readonly: false,
              type: "number",
              sample: "",
              _links: []
            },
            {
              name: "NroCliente",
              predefined: false,
              private: true,
              readonly: false,
              type: "string",
              sample: "",
              _links: []
            },
            {
              name: "FIRSTNAME",
              predefined: true,
              private: false,
              readonly: false,
              type: "string",
              sample: "FIRST_NAME",
              _links: []
            },
            {
              name: "LASTNAME",
              predefined: true,
              private: false,
              readonly: false,
              type: "string",
              sample: "LAST_NAME",
              _links: []
            },
            {
              name: "EMAIL",
              predefined: true,
              private: false,
              readonly: true,
              type: "email",
              sample: "EMAIL",
              _links: []
            }
          ],
        _links: []
      };

      fetchStub
        .withArgs(
          `https://restapi.fromdoppler.com/accounts/${querystring.escape(
            dopplerAccountName
          )}/fields`,
          { headers: { Authorization: `token ${dopplerApiKey}` } }
        )
        .returns(
          Promise.resolve({
            status: 201,
            json: async function() {
              return dopplerApiResponse;
            },
          })
        );

      this.sandbox
        .stub(mocks.wrappedRedisClient, 'hgetall')
        .callsFake((_key, cb) => {
          cb(null, { accessToken, dopplerAccountName, dopplerApiKey });
        });

      let firstEtag;
      await request(app)
        .get('/fields')
        .set('cookie', cookie)
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(200);
          firstEtag = res.get('etag');
        });

      // Add new field to Doppler response
      dopplerApiResponse.items.push({
        name: "NEW-FIELD",
        predefined: false,
        private: true,
        readonly: false,
        type: "number",
        sample: "",
        _links: []
      });

      await request(app)
        .get('/fields')
        .set('cookie', cookie)
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(200);
          // ETag should be different because there are a new field in Doppler response
          expect(res.get('etag')).not.to.be.eql(firstEtag);
        });

        // Remove the new field from Doppler response
        dopplerApiResponse.items.pop();

        await request(app)
        .get('/fields')
        .set('cookie', cookie)
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(200);
          // ETag should be the same as the beginning because the new field in Doppler response has been removed
          expect(res.get('etag')).to.be.eql(firstEtag);
        });
    });
  });

  describe('POST /fields-mapping', function() {
    it('Should return 200 status code on success', async function() {
      await request(app)
        .post('/fields-mapping')
        .send({
          fieldsMapping: [
            { shopify: 'first_name', doppler: 'FIRSTNAME' },
            { shopify: 'last_name', doppler: 'LASTNAME' },
            { shopify: 'default_address.company', doppler: 'NroCliente' },
          ],
        })
        .set('cookie', cookie)
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(200);
        });
    });
  });

  describe('POST /synchronize-customers', function() {
    it('Should return 201 status code on success', async function() {
      this.sandbox
        .stub(mocks.wrappedRedisClient, 'hgetall')
        .callsFake((_key, cb) => {
          cb(null, {
            shop: shopDomain,
            accessToken,
            dopplerAccountName,
            dopplerApiKey,
            fieldsMapping,
            dopplerListId,
          });
        });

      const expectedRequestBody = JSON.stringify(
        dopplerApiPayloads.IMPORT_SUBSCRIBERS_PAYLOAD
      );

      fetchStub
        .withArgs(
          `https://restapi.fromdoppler.com/accounts/${querystring.escape(
            dopplerAccountName
          )}/lists/${dopplerListId}/subscribers/import`,
          {
            body: expectedRequestBody,
            method: 'POST',
            headers: { Authorization: `token ${dopplerApiKey}`, "X-Doppler-Subscriber-Origin": "Shopify" },
          }
        )
        .returns(
          Promise.resolve({
            status: 202,
            json: async function() {
              return dopplerApiResponses.IMPORT_TASK_CREATED_202;
            },
          })
        );

      gotStub.returns(
        Promise.resolve({
          headers: { 'x-shopify-shop-api-call-limit': '1/9999' },
          body: {
            customers: [
              {
                id: 623558295613,
                email: 'jonsnow@example.com',
                first_name: 'Jon',
                last_name: 'Snow',
                default_address: {
                  company: 'Winterfell',
                },
              },
              {
                id: 546813203473,
                email: 'nickrivers@example.com',
                first_name: 'Nick',
                last_name: 'Rivers',
                default_address: {
                  company: 'Top Secret',
                },
              },
            ],
          },
        })
      );

      await request(app)
        .post('/synchronize-customers')
        .set('cookie', cookie)
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(201);
        });
    });
  });

  describe('POST /hooks/app/uninstalled', function() {
    it('Should return 401 status code when invalid hmac signature ', async function() {
      await request(app)
        .post('/hooks/app/uninstalled')
        .set('X-Shopify-Hmac-Sha256', 'AAAAAAAAAAAAAAAAAA')
        .set('X-Shopify-Topic', 'app/uninstalled')
        .set('X-Shopify-Shop-Domain', shopDomain)
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(401);
        });
    });

    it('Should return 401 status code when shop does not exist', async function() {
      this.sandbox
        .stub(mocks.wrappedRedisClient, 'hgetall')
        .callsFake((_key, cb) => {
          cb(null, null);
        });

      await request(app)
        .post('/hooks/app/uninstalled')
        .set('X-Shopify-Hmac-Sha256', 'AAAAAAAAAAAAAAAAAA')
        .set('X-Shopify-Topic', 'app/uninstalled')
        .set('X-Shopify-Shop-Domain', shopDomain)
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(401);
        });
    });

    it('Should return 200 status code on success', async function() {
      this.sandbox
        .stub(mocks.wrappedRedisClient, 'hgetall')
        .callsFake((_key, cb) => {
          cb(null, { accessToken });
        });

      const hmac = crypto
        .createHmac('sha256', process.env.SHOPIFY_APP_SECRET)
        .update(new Buffer([]))
        .digest('base64');

      await request(app)
        .post('/hooks/app/uninstalled')
        .set('X-Shopify-Hmac-Sha256', hmac)
        .set('X-Shopify-Topic', 'app/uninstalled')
        .set('X-Shopify-Shop-Domain', shopDomain)
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(200);
        });
    });
  });

  describe('POST /hooks/customers/created', function() {
    it('Should return 200 status code on success', async function() {
      this.sandbox
        .stub(mocks.wrappedRedisClient, 'hgetall')
        .callsFake((_key, cb) => {
          cb(null, {
            shop: shopDomain,
            accessToken,
            dopplerAccountName,
            dopplerApiKey,
            fieldsMapping,
            dopplerListId,
          });
        });

      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: async function() {
            return dopplerApiResponses.SUBSCRIBER_ADDED_TO_LIST_200;
          },
        })
      );

      const hmac = crypto
        .createHmac('sha256', process.env.SHOPIFY_APP_SECRET)
        .update(
          Buffer.from(
            '{"id":623558295613,"email":"jonsnow@example.com","first_name":"Jon","last_name":"Snow","default_address":{"company":"Winterfell"}}'
          )
        )
        .digest('base64');

      await request(app)
        .post('/hooks/customers/created')
        .set('X-Shopify-Hmac-Sha256', hmac)
        .set('X-Shopify-Topic', 'app/uninstalled')
        .set('X-Shopify-Shop-Domain', shopDomain)
        .send(
          '{"id":623558295613,"email":"jonsnow@example.com","first_name":"Jon","last_name":"Snow","default_address":{"company":"Winterfell"}}'
        )
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(200);
        });
    });
  });

  describe('POST hooks/doppler-import-completed', function() {
    it('Should return 200 status code on success', async function() {
      await request(app)
        .post(`/hooks/doppler-import-completed?shop=${shopDomain}`)
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(200);
        });
    });
  });

  describe('GET /me/shops', function() {
    it('Should return 401 status code when there is not authorization header present', async function() {
      await request(app)
        .get('/me/shops')
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(401);
          expect('Missing `Authorization` header').to.be.eql(res.text);
        });
    });

    it('Should return 401 status code when invalid token format (1)', async function() {
      await request(app)
        .get('/me/shops')
        .set('Authorization', 'INVALID HEADER')
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(401);
          expect(res.text).to.be.eql('Invalid `Authorization` token format. It should be something like: `Authorization: token {DopplerApiKey/DopplerJwtToken}`.');
        });
    });

    it('Should return 401 status code when invalid token format (2)', async function() {
      await request(app)
        .get('/me/shops')
        .set('Authorization', 'token')
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(401);
          expect(res.text).to.be.eql('Invalid `Authorization` token format. It should be something like: `Authorization: token {DopplerApiKey/DopplerJwtToken}`.');
        });
    });

    it('Should return 401 status code when invalid token format (APIKEY without a character)', async function() {
      await request(app)
        .get('/me/shops')
        .set('Authorization', `token ${dopplerApiKey.substring(0, 31)}`)
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(401);
          expect(res.text).to.be.eql('Invalid `Authorization` token format. Expected a Doppler API Key or a Doppler JWT Token.');
        });
    });
    
    it('Should return 200 status code when a token is passed as authorization header', async function() {
      await request(app)
        .get('/me/shops')
        .set('Authorization', `token ${dopplerApiKey}`)
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(200);
        });
    });

    it('Should accept GET CORS request from https://app.fromdoppler.com', async function() {
      await request(app)
        .get('/me/shops')
        .set('Authorization', `token ${dopplerApiKey}`)
        .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:68.0) Gecko/20100101 Firefox/68.0')
        .set('Accept', '*/*')
        .set('Referer', 'https://app.fromdoppler.com/')
        .set('Origin', 'https://app.fromdoppler.com')
        .expect(function(res) {
          expect(res.get('Access-Control-Allow-Origin')).to.be.eql('https://app.fromdoppler.com');
          expect(res.get('Access-Control-Allow-Credentials')).to.be.eql('true');
        });
    });

    it('Should include ETag in Access-Control-Expose-Headers in response', async function() {
      await request(app)
        .get('/me/shops')
        .set('Authorization', `token ${dopplerApiKey}`)
        .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:68.0) Gecko/20100101 Firefox/68.0')
        .set('Accept', '*/*')
        .set('Referer', 'https://app.fromdoppler.com/')
        .set('Origin', 'https://app.fromdoppler.com')
        .expect(function(res) {
          expect(res.get('Access-Control-Expose-Headers')).to.be.eql('ETag');
        });
    });

    it('Should accept OPTIONS CORS request from https://app.fromdoppler.com', async function() {
      await request(app)
        .options('/me/shops')
        .set('Authorization', `token ${dopplerApiKey}`)
        .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:68.0) Gecko/20100101 Firefox/68.0')
        .set('Accept', '*/*')
        .set('Referer', 'https://app.fromdoppler.com/')
        .set('Origin', 'https://app.fromdoppler.com')
        .expect(function(res) {
          expect(res.get('Access-Control-Allow-Origin')).to.be.eql('https://app.fromdoppler.com');
          expect(res.get('Access-Control-Allow-Methods')).to.be.eql('GET,HEAD,PUT,PATCH,POST,DELETE');
          expect(res.get('Access-Control-Allow-Headers')).to.be.eql('Content-Type,Authorization,Accept');
          expect(res.get('Access-Control-Allow-Credentials')).to.be.eql('true');
        });
    });

    it('Should accept OPTIONS CORS request from localhost', async function() {
      await request(app)
        .options('/me/shops')
        .set('Authorization', `token ${dopplerApiKey}`)
        .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:68.0) Gecko/20100101 Firefox/68.0')
        .set('Accept', '*/*')
        .set('Referer', 'http://localhost:3000/')
        .set('Origin', 'http://localhost:3000')
        .expect(function(res) {
          expect(res.get('Access-Control-Allow-Origin')).to.be.eql('http://localhost:3000');
          expect(res.get('Access-Control-Allow-Methods')).to.be.eql('GET,HEAD,PUT,PATCH,POST,DELETE');
          expect(res.get('Access-Control-Allow-Headers')).to.be.eql('Content-Type,Authorization,Accept');
          expect(res.get('Access-Control-Allow-Credentials')).to.be.eql('true');
        });
    });

    it('Should not accept GET CORS request from arbitrary origin', async function() {
      await request(app)
        .get('/me/shops')
        .set('Authorization', `token ${dopplerApiKey}`)
        .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:68.0) Gecko/20100101 Firefox/68.0')
        .set('Accept', '*/*')
        .set('Referer', 'https://wrong.fromdoppler.com/')
        .set('Origin', 'https://wrong.fromdoppler.com')
        .expect(function(res) {
          expect(res.get('Access-Control-Allow-Origin')).to.be.undefined;
        });
    });

    it('Should not accept OPTIONS CORS request from arbitrary origin', async function() {
      await request(app)
        .options('/me/shops')
        .set('Authorization', `token ${dopplerApiKey}`)
        .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:68.0) Gecko/20100101 Firefox/68.0')
        .set('Accept', '*/*')
        .set('Referer', 'https://wrong.fromdoppler.com/')
        .set('Origin', 'https://wrong.fromdoppler.com')
        .expect(function(res) {
          expect(res.get('Access-Control-Allow-Origin')).to.be.undefined;
        });
    });
  });

  describe('POST /me/synchronize-customers', function() {
    it('Should return 201 status code on success', async function() {
      this.sandbox
        .stub(mocks.wrappedRedisClient, 'hgetall')
        .callsFake((_key, cb) => {
          cb(null, {
            shop: shopDomain,
            accessToken,
            dopplerAccountName,
            dopplerApiKey,
            fieldsMapping,
            dopplerListId,
          });
        });

      const expectedRequestBody = JSON.stringify(
        dopplerApiPayloads.IMPORT_SUBSCRIBERS_PAYLOAD
      );

      fetchStub
        .withArgs(
          `https://restapi.fromdoppler.com/accounts/${querystring.escape(
            dopplerAccountName
          )}/lists/${dopplerListId}/subscribers/import`,
          {
            body: expectedRequestBody,
            method: 'POST',
            headers: { Authorization: `token ${dopplerApiKey}`, "X-Doppler-Subscriber-Origin": "Shopify" },
          }
        )
        .returns(
          Promise.resolve({
            status: 202,
            json: async function() {
              return dopplerApiResponses.IMPORT_TASK_CREATED_202;
            },
          })
        );

      gotStub.returns(
        Promise.resolve({
          headers: { 'x-shopify-shop-api-call-limit': '1/9999' },
          body: {
            customers: [
              {
                id: 623558295613,
                email: 'jonsnow@example.com',
                first_name: 'Jon',
                last_name: 'Snow',
                default_address: {
                  company: 'Winterfell',
                },
              },
              {
                id: 546813203473,
                email: 'nickrivers@example.com',
                first_name: 'Nick',
                last_name: 'Rivers',
                default_address: {
                  company: 'Top Secret',
                },
              },
            ],
          },
        })
      );

      await request(app)
        .post('/me/synchronize-customers')
        .set('Authorization', `token ${dopplerApiKey}`)
        .send({ shop: shopDomain })
        .expect(function(res) {
          expect(res.statusCode).to.be.eql(201);
        });
    });
  });
});
