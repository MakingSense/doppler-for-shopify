require('dotenv').config({ path: '.env.tests' });
const fs = require('fs');
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const throwsAsync = require('../../test-utilities/chai-throws-async');
const dopplerApiResponses = require('../../test-utilities/doppler-api-responses');
const dopplerApiPayloads = require('../../test-utilities/doppler-api-payloads');
const expect = chai.expect;

var fetchStub = sinon.stub();
const Doppler = require('./doppler-client')(fetchStub);

describe('The doppler-client module', function() {
  before(function() {
    chai.use(sinonChai);
  });

  it('AreCredentialsValidAsync should return true when valid credentials are provided', async function() {
    fetchStub.returns(
      Promise.resolve({
        status: 200,
        json: async function() {
          return dopplerApiResponses.HOME_200;
        },
      })
    );

    const doppler = Doppler.createClient(
      'user@example.com',
      'C22CADA13759DB9BBDF93B9D87C14D5A'
    );

    const result = await doppler.AreCredentialsValidAsync();

    expect(fetchStub).to.be.calledWithExactly(
      'https://restapi.fromdoppler.com/accounts/user%40example.com',
      {
        headers: { Authorization: 'token C22CADA13759DB9BBDF93B9D87C14D5A' },
      }
    );
    expect(result).to.be.true;
  });

  it('AreCredentialsValidAsync should return false when invalid email and API Key are provided', async function() {
    fetchStub.returns(
      Promise.resolve({
        status: 401,
        json: async function() {
          return dopplerApiResponses.INVALID_TOKEN_401;
        },
      })
    );

    const doppler = Doppler.createClient(
      'user@example.com',
      'C22CADA13759DB9BBDF93B9D87C14D5A'
    );
    const result = await doppler.AreCredentialsValidAsync();

    expect(result).to.be.false;
  });

  it('AreCredentialsValidAsync should return false when invalid email is provided', async function() {
    fetchStub.returns(
      Promise.resolve({
        status: 403,
        json: async function() {
          return dopplerApiResponses.FORBIDDEN_WRONG_ACCOUNT_403;
        },
      })
    );

    const doppler = Doppler.createClient(
      'otheruser@example.com',
      'C22CADA13759DB9BBDF93B9D87C14D5A'
    );
    const result = await doppler.AreCredentialsValidAsync();

    expect(result).to.be.false;
  });

  it('AreCredentialsValidAsync should return false when invalid API Key is provided', async function() {
    fetchStub.returns(
      Promise.resolve({
        status: 401,
        json: async function() {
          return dopplerApiResponses.INVALID_TOKEN_401;
        },
      })
    );

    const doppler = Doppler.createClient(
      'user@example.com',
      'C22CADA13759DB9BBDF93B9D87C14D5A'
    );
    const result = await doppler.AreCredentialsValidAsync();

    expect(result).to.be.false;
  });

  it('AreCredentialsValidAsync should throw new when Doppler API calls throws an expected error', async function() {
    fetchStub.throws(new Error('Forced Error'));

    const doppler = Doppler.createClient(
      'user@example.com',
      'C22CADA13759DB9BBDF93B9D87C14D5A'
    );

    await throwsAsync(async () => {
      await doppler.AreCredentialsValidAsync();
    }, 'Unexpected error calling Doppler API');
  });

  it('AreCredentialsValidAsync should raise exception when Doppler returns Internal Server Error', async function() {
    fetchStub.returns(
      Promise.resolve({
        status: 500,
        json: async function() {
          return { detail: 'Doppler API throws 500' };
        },
      })
    );

    const doppler = Doppler.createClient(
      'user@example.com',
      'C22CADA13759DB9BBDF93B9D87C14D5A'
    );

    await throwsAsync(async () => {
      await doppler.AreCredentialsValidAsync();
    }, 'Doppler API throws 500');
  });

  it('getListsAsync should return the array of lists', async function() {
    fetchStub.returns(
      Promise.resolve({
        status: 200,
        json: async function() {
          return dopplerApiResponses.LISTS_PAGE_RESULT_200;
        },
      })
    );

    const doppler = Doppler.createClient(
      'user@example.com',
      'C22CADA13759DB9BBDF93B9D87C14D5A'
    );
    const result = await doppler.getListsAsync();

    expect(result).to.be.eql({
      items: [
        { listId: 1459381, name: 'shopify' },
        { listId: 1222381, name: 'marketing' },
        { listId: 1170501, name: 'development' },
      ],
      itemsCount: 3,
    });

    expect(fetchStub).to.be.calledWithExactly(
      'https://restapi.fromdoppler.com/accounts/user%40example.com/lists?page=1&per_page=200&state=active',
      {
        headers: { Authorization: 'token C22CADA13759DB9BBDF93B9D87C14D5A' },
      }
    );
  });

  it('getListsAsync should raise an error when API returns error status code', async function() {
    fetchStub.returns(
      Promise.resolve({
        status: 500,
        json: async function() {
          return { details: 'unexpected error' };
        },
      })
    );

    const doppler = Doppler.createClient(
      'user@example.com',
      'C22CADA13759DB9BBDF93B9D87C14D5A'
    );

    await throwsAsync(async () => {
      await doppler.getListsAsync();
    }, 'Unexpected error');
  });

  it('getImportTaskAsync should return the import details', async function() {
    fetchStub.returns(
      Promise.resolve({
        status: 200,
        json: async function() {
          return dopplerApiResponses.IMPORT_TASK_RESULT_200;
        },
      })
    );

    const doppler = Doppler.createClient(
      'user@example.com',
      'C22CADA13759DB9BBDF93B9D87C14D5A'
    );

    var result = await doppler.getImportTaskAsync('import-222031');

    expect(result).to.be.eql({
      listId: 776396,
      contentType: 'application/json',
      deleteCustomFieldsData: false,
      status: 'completed',
      numberOfAttempts: 0,
      dateLastImported: '2015-12-23T01:28:31.14',
      processed: 99,
      invalidEmails: 0,
      softBounceds: 0,
      hardBounceds: 0,
      subscriberBounceds: 0,
      amountHeadersAndFieldsDontMatch: 0,
      neverOpenBounceds: 0,
      updated: 0,
      newSubscribers: 99,
      duplicated: 0,
      unsubscribedByUser: 0,
      usersInBlackList: 0,
      duplicatedField: 0,
    });

    expect(fetchStub).to.be.calledWithExactly(
      'https://restapi.fromdoppler.com/accounts/user%40example.com/tasks/import-222031',
      {
        headers: { Authorization: 'token C22CADA13759DB9BBDF93B9D87C14D5A' },
      }
    );
  });

  it('getImportTaskAsync should raise an error when the API could not found the task', async function() {
    fetchStub.returns(
      Promise.resolve({
        status: 404,
        json: async function() {
          return dopplerApiResponses.TASK_NOT_FOUND_404;
        },
      })
    );

    const doppler = Doppler.createClient(
      'user@example.com',
      'C22CADA13759DB9BBDF93B9D87C14D5A'
    );

    await throwsAsync(async () => {
      await doppler.getImportTaskAsync('import-123456');
    }, 'Entity Not Found: Task `id:import-123456` does not exist for User `id:92651`. - Resolving `/accounts/user@example.com/tasks/import-123456`');
  });

  it('createListAsync should create the list', async function() {
    fetchStub.returns(
      Promise.resolve({
        status: 201,
        json: async function() {
          return dopplerApiResponses.LIST_CREATED_201;
        },
      })
    );

    const doppler = Doppler.createClient(
      'user@example.com',
      'C22CADA13759DB9BBDF93B9D87C14D5A'
    );

    const result = await doppler.createListAsync('Fresh List');

    expect(result).to.be.eql('1462409');
    expect(fetchStub).to.be.calledWithExactly(
      'https://restapi.fromdoppler.com/accounts/user%40example.com/lists',
      {
        body: '{"name":"Fresh List"}',
        method: 'POST',
        headers: { Authorization: 'token C22CADA13759DB9BBDF93B9D87C14D5A' },
      }
    );
  });

  it('createListAsync should raise an error when list name is duplicated', async function() {
    fetchStub.returns(
      Promise.resolve({
        status: 400,
        json: async function() {
          return dopplerApiResponses.DUPLICATED_LIST_NAME_400;
        },
      })
    );

    const doppler = Doppler.createClient(
      'user@example.com',
      'C22CADA13759DB9BBDF93B9D87C14D5A'
    );

    await throwsAsync(async () => {
      await doppler.createListAsync('Fresh List');
    }, "Duplicated list name: You've already named another List the same way (`Fresh List`).");
  });

  it('getFieldsAsync should return the array of fields', async function() {
    fetchStub.returns(
      Promise.resolve({
        status: 200,
        json: async function() {
          return dopplerApiResponses.FIELDS_RESULT_200;
        },
      })
    );

    const doppler = Doppler.createClient(
      'user@example.com',
      'C22CADA13759DB9BBDF93B9D87C14D5A'
    );

    const result = await doppler.getFieldsAsync();

    expect(result).to.be.eql([
      {
        name: 'presupuesto',
        predefined: false,
        private: true,
        readonly: false,
        sample: '',
        type: 'number',
      },
      {
        name: 'NroCliente',
        predefined: false,
        private: true,
        readonly: false,
        sample: '',
        type: 'string',
      },
      {
        name: 'FIRSTNAME',
        predefined: true,
        private: false,
        readonly: false,
        sample: 'FIRST_NAME',
        type: 'string',
      },
      {
        name: 'LASTNAME',
        predefined: true,
        private: false,
        readonly: false,
        sample: 'LAST_NAME',
        type: 'string',
      },
      {
        name: 'EMAIL',
        predefined: true,
        private: false,
        readonly: true,
        sample: 'EMAIL',
        type: 'email',
      },
    ]);

    expect(fetchStub).to.be.calledWithExactly(
      'https://restapi.fromdoppler.com/accounts/user%40example.com/fields',
      {
        headers: { Authorization: 'token C22CADA13759DB9BBDF93B9D87C14D5A' },
      }
    );
  });

  it('getFieldsAsync should raise the error when the API returns a failed status code', async function() {
    fetchStub.returns(
      Promise.resolve({
        status: 500,
        json: async function() {
          return { detail: 'Unexpected error' };
        },
      })
    );

    const doppler = Doppler.createClient(
      'user@example.com',
      'C22CADA13759DB9BBDF93B9D87C14D5A'
    );

    await throwsAsync(async () => {
      await doppler.getFieldsAsync();
    }, 'Unexpected error');
  });

  it('createFieldsMapping should merge Doppler subscriber and Shopify customer fields correctly', async function() {
    fetchStub.returns(
      Promise.resolve({
        status: 200,
        json: async function() {
          return dopplerApiResponses.FIELDS_RESULT_200;
        },
      })
    );

    const mapping = [
      { shopify: 'first_name', doppler: 'FIRSTNAME' },
      { shopify: 'last_name', doppler: 'LASTNAME' },
      { shopify: 'default_address.company', doppler: 'NroCliente' },
    ];

    const doppler = Doppler.createClient(
      'user@example.com',
      'C22CADA13759DB9BBDF93B9D87C14D5A'
    );

    const result = await doppler.createFieldsMapping(mapping);

    expect(result).to.be.eql([
      {
        name: 'FIRSTNAME',
        predefined: true,
        private: false,
        readonly: false,
        type: 'string',
        sample: 'FIRST_NAME',
        value: 'first_name',
      },
      {
        name: 'LASTNAME',
        predefined: true,
        private: false,
        readonly: false,
        type: 'string',
        sample: 'LAST_NAME',
        value: 'last_name',
      },
      {
        name: 'NroCliente',
        predefined: false,
        private: true,
        readonly: false,
        type: 'string',
        sample: '',
        value: 'default_address.company',
      },
    ]);
  });

  it('createFieldsMapping should throw an error when attempting to merge fields of different types', async function() {
    fetchStub.returns(
      Promise.resolve({
        status: 200,
        json: async function() {
          return dopplerApiResponses.FIELDS_RESULT_200;
        },
      })
    );

    const mapping = [{ shopify: 'first_name', doppler: 'presupuesto' }];

    const doppler = Doppler.createClient(
      'user@example.com',
      'C22CADA13759DB9BBDF93B9D87C14D5A'
    );

    await throwsAsync(async () => {
      await doppler.createFieldsMapping(mapping);
    }, 'Error when mapping Shopify field "First Name" with Doppler field "presupuesto": different types.');
  });

  it('createFieldsMapping should throw an error when attempting to map inexisting Doppler field', async function() {
    fetchStub.returns(
      Promise.resolve({
        status: 200,
        json: async function() {
          return dopplerApiResponses.FIELDS_RESULT_200;
        },
      })
    );

    const mapping = [{ shopify: 'first_name', doppler: 'PRIMER_NOMBRE' }];

    const doppler = Doppler.createClient(
      'user@example.com',
      'C22CADA13759DB9BBDF93B9D87C14D5A'
    );

    await throwsAsync(async () => {
      await doppler.createFieldsMapping(mapping);
    }, 'Error when mapping Shopify field "first_name": Doppler field "PRIMER_NOMBRE" does not exist.');
  });

  it('createFieldsMapping should throw an error when attempting to map inexisting Shopify field', async function() {
    fetchStub.returns(
      Promise.resolve({
        status: 200,
        json: async function() {
          return dopplerApiResponses.FIELDS_RESULT_200;
        },
      })
    );

    const mapping = [{ shopify: 'primer_nombre', doppler: 'FIRSTNAME' }];

    const doppler = Doppler.createClient(
      'user@example.com',
      'C22CADA13759DB9BBDF93B9D87C14D5A'
    );

    await throwsAsync(async () => {
      await doppler.createFieldsMapping(mapping);
    }, 'Error when mapping Shopify field "primer_nombre": The field does not exist.');
  });

  it('importSubscribersAsync should import the subscribers with the mapped fields', async function() {
    fetchStub.returns(
      Promise.resolve({
        status: 202,
        json: async function() {
          return dopplerApiResponses.IMPORT_TASK_CREATED_202;
        },
      })
    );

    const doppler = Doppler.createClient(
      'user@example.com',
      'C22CADA13759DB9BBDF93B9D87C14D5A'
    );
    const customers = [
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
    ];
    const fieldsMap = [
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
    ];

    const result = await doppler.importSubscribersAsync(
      customers,
      178945,
      'store.myshopify.com',
      fieldsMap
    );

    const expectedRequestBody = JSON.stringify(
      dopplerApiPayloads.IMPORT_SUBSCRIBERS_PAYLOAD
    );

    expect('import-99562376').to.be.eqls(result);
    expect(fetchStub).to.be.calledWithExactly(
      'https://restapi.fromdoppler.com/accounts/user%40example.com/lists/178945/subscribers/import',
      {
        body: expectedRequestBody,
        method: 'POST',
        headers: { "Authorization": 'token C22CADA13759DB9BBDF93B9D87C14D5A', "X-Doppler-Subscriber-Origin": "Shopify" },
      }
    );
  });

  it('createSubscriberAsync should create the subscriber with the mapped fields', async function() {
    fetchStub.returns(
      Promise.resolve({
        status: 200,
        json: async function() {
          return dopplerApiResponses.SUBSCRIBER_ADDED_TO_LIST_200;
        },
      })
    );

    const doppler = Doppler.createClient(
      'user@example.com',
      'C22CADA13759DB9BBDF93B9D87C14D5A'
    );
    const customer = {
      id: 623558295613,
      email: 'jonsnow@example.com',
      first_name: 'Jon',
      last_name: 'Snow',
      default_address: {
        company: 'Winterfell',
      },
    };
    const fieldsMap = [
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
    ];

    await doppler.createSubscriberAsync(customer, 178945, fieldsMap);

    const expectedRequestBody = JSON.stringify({
      email: 'jonsnow@example.com',
      fields: [
        {
          name: 'FIRSTNAME',
          value: 'Jon',
        },
        {
          name: 'LASTNAME',
          value: 'Snow',
        },
        {
          name: 'Empresa',
          value: 'Winterfell',
        },
      ],
    });

    expect(fetchStub).to.be.calledWithExactly(
      'https://restapi.fromdoppler.com/accounts/user%40example.com/lists/178945/subscribers',
      {
        body: expectedRequestBody,
        method: 'POST',
        headers: { "Authorization": 'token C22CADA13759DB9BBDF93B9D87C14D5A', "X-Doppler-Subscriber-Origin": "Shopify" },
      }
    );
  });

  it('putShopifyIntegrationAsync should call Doppler API with the right payload', async function() {
    fetchStub.returns(
      Promise.resolve({
        status: 200,
        json: async function() {
          return dopplerApiResponses.INTEGRATION_UPDATED_200
        },
      })
    );

    const doppler = Doppler.createClient(
      'user@example.com',
      'C22CADA13759DB9BBDF93B9D87C14D5A'
    );

    await doppler.putShopifyIntegrationAsync('dopplertest.myshopify.com', '127424ab9aa0ebce26dfdc786bc7fba4');

    expect(fetchStub).to.be.calledWithExactly(
      'https://restapi.fromdoppler.com/accounts/user%40example.com/integrations/shopify',
      {
        body: JSON.stringify({
          accessToken: '127424ab9aa0ebce26dfdc786bc7fba4',
          accountName: 'dopplertest.myshopify.com'
        }),
        method: 'PUT',
        headers: { "Authorization": 'token C22CADA13759DB9BBDF93B9D87C14D5A' },
      }
    );
  });
});
