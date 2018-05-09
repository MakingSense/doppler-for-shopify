require('dotenv').config({ path: '.env.tests' });
const fs = require('fs');
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const throwsAsync = require('../../test-utilities/chai-throws-async');
const expect = chai.expect;

var fetchStub = sinon.stub();
const Doppler = require('./doppler-client')(fetchStub)

describe('The doppler-client module', function () {

  before(function () {
    chai.use(sinonChai);

    // Redirect the standard errors to a file in order to not mess the output up.
    const access = fs.createWriteStream('test_stderr.log');
    process.stderr.write = access.write.bind(access);
  })
 
  it('AreCredentialsValidAsync should return true when valid credentials are provided', async function () {
    fetchStub.returns(Promise.resolve({
      status: 200,
      json: async function() {
        return { 
          message: 'Welcome to Email Marketing Hypermedia API user@example.com, please follow the links.',
          _links: []
        };
      }
    }));
    
    const doppler = Doppler.createClient('user@example.com', 'C22CADA13759DB9BBDF93B9D87C14D5A');
    
    const result = await doppler.AreCredentialsValidAsync();

    expect(fetchStub).to.be.calledWithExactly('https://restapi.fromdoppler.com/accounts/user%40example.com', 
    {
      headers: { Authorization: "token C22CADA13759DB9BBDF93B9D87C14D5A" }
    });
    expect(result).to.be.true;
  });

  it('AreCredentialsValidAsync should return false when invalid email and API Key are provided', async function () {
    fetchStub.returns(Promise.resolve({
      status: 401,
      json: async function() {
        return { 
          title: 'Invalid token',
          detail: 'Authentication Token is not valid',
          errorCode: 1,
          status: 401,
          type: '/docs/errors/401.1-invalid-token',
          _links: []
        };
      }
    }));

    const doppler = Doppler.createClient('user@example.com', 'C22CADA13759DB9BBDF93B9D87C14D5A');
    const result = await doppler.AreCredentialsValidAsync();

    expect(result).to.be.false;
  });

  it('AreCredentialsValidAsync should return false when invalid email is provided', async function () {
    fetchStub.returns(Promise.resolve({
      status: 403,
      json: async function() {
        return { 
          status: 403,
          title: 'Forbidden, wrong account',
          detail: 'Your user otheruser@example.com does not have access to account user@example.com',
          errorCode: 1,
          type: '/docs/errors/403.1-forbidden-wrong-account',
          _links: [] 
        };
      }
    }));

    const doppler = Doppler.createClient('otheruser@example.com', 'C22CADA13759DB9BBDF93B9D87C14D5A');
    const result = await doppler.AreCredentialsValidAsync();

    expect(result).to.be.false;
  });

  it('AreCredentialsValidAsync should return false when invalid API Key is provided', async function () {
    fetchStub.returns(Promise.resolve({
      status: 401,
      json: async function() {
        return { 
          title: 'Invalid token',
          detail: 'Authentication Token is not valid',
          errorCode: 1,
          status: 401,
          type: '/docs/errors/401.1-invalid-token',
          _links: []
        };
      }
    }));

    const doppler = Doppler.createClient('user@example.com', 'C22CADA13759DB9BBDF93B9D87C14D5A');
    const result = await doppler.AreCredentialsValidAsync();

    expect(result).to.be.false;
  });

  it('getListsAsync should return the array of lists', async function () {
    fetchStub.returns(Promise.resolve({
      status: 200,
      json: async function() {
        return { 
          items:
             [ { listId: 1459381,
               name: 'shopify',
               currentStatus: 'ready',
               subscribersCount: 9,
               creationDate: '2018-04-30T23:29:08.067Z',
               _links: [] },
             { listId: 1222381,
               name: 'marketing',
               currentStatus: 'ready',
               subscribersCount: 4,
               creationDate: '2018-03-22T11:47:33.497Z',
               _links: [] },
             { listId: 1170501,
               name: 'development',
               currentStatus: 'ready',
               subscribersCount: 4,
               creationDate: '2017-12-22T21:01:26.08Z',
               _links: [] }],
            pageSize: 200,
            itemsCount: 3,
            currentPage: 1,
            pagesCount: 1,
            _links: []
        };
      }
    }));

    const doppler = Doppler.createClient('user@example.com', 'C22CADA13759DB9BBDF93B9D87C14D5A');
    const result = await doppler.getListsAsync();

    expect(result).to.be.eql({
      items: [
        { listId: 1459381, name: 'shopify' },
        { listId: 1222381, name: 'marketing' },
        { listId: 1170501, name: 'development' }
      ],
      itemsCount: 3
    });

    expect(fetchStub).to.be.calledWithExactly('https://restapi.fromdoppler.com/accounts/user%40example.com/lists?page=1&per_page=200&state=active', 
      {
        headers: { Authorization: "token C22CADA13759DB9BBDF93B9D87C14D5A" }
      });
  });

  it('getListsAsync should raise an error when API returns error status code', async function () {
    fetchStub.returns(Promise.resolve({
      status: 500,
      json: async function() {
        return { details: 'unexpected error' };
      }
    }));

    const doppler = Doppler.createClient('user@example.com', 'C22CADA13759DB9BBDF93B9D87C14D5A');

    await throwsAsync(async () => { await doppler.getListsAsync() }, 'Unexpected error');
  });

  it('getImportTaskAsync should return the import details', async function () {
    fetchStub.returns(Promise.resolve({
      status: 200,
      json: async function() {
        return { 
          importDetails:
          { listId: 776396,
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
            duplicatedField: 0 },
           taskType: 'import',
           taskId: 'import-222031',
           itemsProcessed: 99,
           status: 'completed',
           startDate: '2015-12-23T01:28:49.337Z',
           finishDate: '2015-12-23T01:28:31.157Z',
           _links: []
         };
      }
    }));

    const doppler = Doppler.createClient('user@example.com', 'C22CADA13759DB9BBDF93B9D87C14D5A');
    
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
      duplicatedField: 0 }
    );

    expect(fetchStub).to.be.calledWithExactly('https://restapi.fromdoppler.com/accounts/user%40example.com/tasks/import-222031',
    {
      headers: { Authorization: "token C22CADA13759DB9BBDF93B9D87C14D5A" }
    });
  });

  it('getImportTaskAsync should raise an error when the API could not found the task', async function () {
    fetchStub.returns(Promise.resolve({
      status: 404,
      json: async function() {
        return {
          title: "Entity Not Found",
          detail: "Task `id:import-123456` does not exist for User `id:92651`. - Resolving `/accounts/user@example.com/tasks/import-123456`",
          status: 404,
          errorCode: 1,
          resourceNotFoundPath: "/accounts/user@example.com/tasks/import-123456",
          type: "/docs/errors/404.1-entity-not-found",
          _links: []
        };
      }
    }));

    const doppler = Doppler.createClient('user@example.com', 'C22CADA13759DB9BBDF93B9D87C14D5A');

    await throwsAsync(async () => { await doppler.getImportTaskAsync('import-123456') }, "Entity Not Found: Task `id:import-123456` does not exist for User `id:92651`. - Resolving `/accounts/user@example.com/tasks/import-123456`");
  });

  it('createListAsync should create the list', async function () {
    fetchStub.returns(Promise.resolve({
      status: 201,
      json: async function() {
        return {
          createdResourceId: "1462409",
          message: "List successfully created",
          _links: []
          };
      }
    }));

    const doppler = Doppler.createClient('user@example.com', 'C22CADA13759DB9BBDF93B9D87C14D5A');
    
    const result = await doppler.createListAsync('Fresh List');

    expect(result).to.be.eql("1462409");
    expect(fetchStub).to.be.calledWithExactly('https://restapi.fromdoppler.com/accounts/user%40example.com/lists',
        { body: '{"name":"Fresh List"}', method: "POST", headers: { Authorization: "token C22CADA13759DB9BBDF93B9D87C14D5A" } });
  });

  it('createListAsync should raise an error when list name is duplicated', async function () {
    fetchStub.returns(Promise.resolve({
      status: 400,
      json: async function() {
        return {
          title: "Duplicated list name",
          status: 400,
          errorCode: 2,
          detail: "You've already named another List the same way (`Fresh List`).",
          type: "/docs/errors/400.2-duplicated-list-name",
          _links: []
          };
      }
    }));

    const doppler = Doppler.createClient('user@example.com', 'C22CADA13759DB9BBDF93B9D87C14D5A');

    await throwsAsync(async () => {await doppler.createListAsync('Fresh List')}, "Duplicated list name: You've already named another List the same way (`Fresh List`).");
  });

  it('getFieldsAsync should return the array of fields', async function () {
    fetchStub.returns(Promise.resolve({
      status: 200,
      json: async function() {
        return {
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
      }
    }));

    const doppler = Doppler.createClient('user@example.com', 'C22CADA13759DB9BBDF93B9D87C14D5A');
    
    const result = await doppler.getFieldsAsync();

    expect(result).to.be.eql([
      {
        name: "presupuesto",
        predefined: false,
        private: true,
        readonly: false,
        type: "number"
      },
      {
        name: "NroCliente",
        predefined: false,
        private: true,
        readonly: false,
        type: "string"
      },
      {
        name: "FIRSTNAME",
        predefined: true,
        private: false,
        readonly: false,
        type: "string"
      },
      {
        name: "LASTNAME",
        predefined: true,
        private: false,
        readonly: false,
        type: "string"
      },
      {
        name: "EMAIL",
        predefined: true,
        private: false,
        readonly: true,
        type: "email"
      }]);

    expect(fetchStub).to.be.calledWithExactly('https://restapi.fromdoppler.com/accounts/user%40example.com/fields',
    {
      headers: { Authorization: "token C22CADA13759DB9BBDF93B9D87C14D5A" }
    });
  });

  it('getFieldsAsync should raise the error when the API returns a failed status code', async function () {
    fetchStub.returns(Promise.resolve({
      status: 500,
      json: async function() {
        return { detail: "Unexpected error" };
      }
    }));

    const doppler = Doppler.createClient('user@example.com', 'C22CADA13759DB9BBDF93B9D87C14D5A');

    await throwsAsync(async () => { await doppler.getFieldsAsync();}, 'Unexpected error');
  });

  it('createFieldsMapping should merge Doppler subscriber and Shopify customer fields correctly', async function() {
    fetchStub.returns(Promise.resolve({
        status: 200,
        json: async function() {
          return {
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
                    name: "Empresa",
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
        }
      }));
  
      const mapping = [
        { shopify: 'first_name', doppler: 'FIRSTNAME' },
        { shopify: 'last_name', doppler: 'LASTNAME' },
        { shopify: 'default_address.company', doppler: 'Empresa' }
      ];
      
      const doppler = Doppler.createClient('user@example.com', 'C22CADA13759DB9BBDF93B9D87C14D5A');

      const result = await doppler.createFieldsMapping(mapping);

      expect(result).to.be.eql([
          {
            name: "FIRSTNAME",
            predefined: true,
            private: false,
            readonly: false,
            type: "string",
            value: 'first_name'
          },
          {
            name: "LASTNAME",
            predefined: true,
            private: false,
            readonly: false,
            type: "string",
            value: 'last_name'
          },
          {
            name: "Empresa",
            predefined: false,
            private: true,
            readonly: false,
            type: "string",
            value: 'default_address.company'
          }
      ]);
  });

  it('createFieldsMapping should throw an error when attempting to merge fields of different types', async function() {
    fetchStub.returns(Promise.resolve({
        status: 200,
        json: async function() {
          return {
              items: [
                  {
                    name: "presupuesto",
                    predefined: false,
                    private: true,
                    readonly: false,
                    type: "number",
                    sample: "",
                    _links: []
                  }
                ],
              _links: []
            };
        }
      }));
  
      const mapping = [
        { shopify: 'first_name', doppler: 'presupuesto' }
      ];
      
      const doppler = Doppler.createClient('user@example.com', 'C22CADA13759DB9BBDF93B9D87C14D5A');

      await throwsAsync(async () => { await doppler.createFieldsMapping(mapping);}, 'Error when mapping Shopify field "First Name" with Doppler field "presupuesto": different types.');
  });

  it('createFieldsMapping should throw an error when attempting to map inexisting Doppler field', async function() {
    fetchStub.returns(Promise.resolve({
        status: 200,
        json: async function() {
          return {
              items: [
                  {
                    name: "presupuesto",
                    predefined: false,
                    private: true,
                    readonly: false,
                    type: "number",
                    sample: "",
                    _links: []
                  }
                ],
              _links: []
            };
        }
      }));
  
      const mapping = [
        { shopify: 'first_name', doppler: 'FIRSTNAME' }
      ];
      
      const doppler = Doppler.createClient('user@example.com', 'C22CADA13759DB9BBDF93B9D87C14D5A');

      await throwsAsync(async () => { await doppler.createFieldsMapping(mapping);}, 'Error when mapping Shopify field "first_name": Doppler field "FIRSTNAME" does not exist.');
  });

  it('createFieldsMapping should throw an error when attempting to map inexisting Shopify field', async function() {
    fetchStub.returns(Promise.resolve({
        status: 200,
        json: async function() {
          return {
              items: [
                  {
                    name: "FIRSTNAME",
                    predefined: false,
                    private: true,
                    readonly: false,
                    type: "string",
                    sample: "",
                    _links: []
                  }
                ],
              _links: []
            };
        }
      }));
  
      const mapping = [
        { shopify: 'primer_nombre', doppler: 'FIRSTNAME' }
      ];
      
      const doppler = Doppler.createClient('user@example.com', 'C22CADA13759DB9BBDF93B9D87C14D5A');

      await throwsAsync(async () => { await doppler.createFieldsMapping(mapping);}, 'Error when mapping Shopify field "primer_nombre": The field does not exist.');
  });

  it("importSubscribersAsync should import the subscribers with the mapped fields", async function() {
    fetchStub.returns(Promise.resolve({
        status: 202,
        json: async function() {
          return {
                createdResourceId: "import-99562376",
                message: "Import task successfully created",
                _links: []
            };
        }
    }));

    const doppler = Doppler.createClient('user@example.com', 'C22CADA13759DB9BBDF93B9D87C14D5A');
    const customers = [
        { 	
            id: 623558295613,
            email: 'jonsnow@example.com',
            first_name: 'Jon',
            last_name: 'Snow',
            default_address:
            {  
               company: 'Winterfell'
            }
        },
        { 	
            id: 546813203473,
            email: 'nickrivers@example.com',
            first_name: 'Nick',
            last_name: 'Rivers',
            default_address:
            {  
               company: 'Top Secret'
            }
        }
    ];
    const fieldsMap = [
        {
          name: "FIRSTNAME",
          predefined: true,
          private: false,
          readonly: false,
          type: "string",
          value: 'first_name'
        },
        {
          name: "LASTNAME",
          predefined: true,
          private: false,
          readonly: false,
          type: "string",
          value: 'last_name'
        },
        {
          name: "Empresa",
          predefined: false,
          private: true,
          readonly: false,
          type: "string",
          value: 'default_address.company'
        }
    ];

    const result = await doppler.importSubscribersAsync(customers, 178945, 'my-store.myshopify.com', fieldsMap);
    
    const expectedRequestBody = JSON.stringify(
        {
            items: [
              {
                email: "jonsnow@example.com",
                fields: [
                 {
                    name: "FIRSTNAME",
                    predefined: true,
                    private: false,
                    readonly: false,
                    type: "string",
                    value: 'Jon'
                  },
                  {
                    name: "LASTNAME",
                    predefined: true,
                    private: false,
                    readonly: false,
                    type: "string",
                    value: 'Snow'
                  },
                  {
                    name: "Empresa",
                    predefined: false,
                    private: true,
                    readonly: false,
                    type: "string",
                    value: 'Winterfell'
                  }
                ]
              },
              {
                email: "nickrivers@example.com",
                fields: [
                 {
                    name: "FIRSTNAME",
                    predefined: true,
                    private: false,
                    readonly: false,
                    type: "string",
                    value: 'Nick'
                  },
                  {
                    name: "LASTNAME",
                    predefined: true,
                    private: false,
                    readonly: false,
                    type: "string",
                    value: 'Rivers'
                  },
                  {
                    name: "Empresa",
                    predefined: false,
                    private: true,
                    readonly: false,
                    type: "string",
                    value: 'Top Secret'
                  }
                ]
              }
            ],
            fields: [
              "FIRSTNAME", "LASTNAME", "Empresa"
            ],
            callback: "https://shopify.fromdoppler.com/hooks/doppler-import-completed?shop=my-store.myshopify.com",
            enableEmailNotification: true
          }
    );

    expect('import-99562376').to.be.eqls(result);
    expect(fetchStub).to.be.calledWithExactly('https://restapi.fromdoppler.com/accounts/user%40example.com/lists/178945/subscribers/import',
        { body: expectedRequestBody, method: 'POST', headers: { Authorization: "token C22CADA13759DB9BBDF93B9D87C14D5A" } });
  });

  it("createSubscriberAsync should create the subscriber with the mapped fields", async function() {
    fetchStub.returns(Promise.resolve({
        status: 200,
        json: async function() {
          return {
            message: "Subscriber successfully added to List",
            _links: []
          };
        }
    }));

    const doppler = Doppler.createClient('user@example.com', 'C22CADA13759DB9BBDF93B9D87C14D5A');
    const customer = { 	
            id: 623558295613,
            email: 'jonsnow@example.com',
            first_name: 'Jon',
            last_name: 'Snow',
            default_address:
            {  
               company: 'Winterfell'
            }
        };
    const fieldsMap = [
        {
          name: "FIRSTNAME",
          predefined: true,
          private: false,
          readonly: false,
          type: "string",
          value: 'first_name'
        },
        {
          name: "LASTNAME",
          predefined: true,
          private: false,
          readonly: false,
          type: "string",
          value: 'last_name'
        },
        {
          name: "Empresa",
          predefined: false,
          private: true,
          readonly: false,
          type: "string",
          value: 'default_address.company'
        }
    ];

    await doppler.createSubscriberAsync(customer, 178945, fieldsMap);
    
    const expectedRequestBody = JSON.stringify(
        {
          email: "jonsnow@example.com",
          fields: [
            {
                name: "FIRSTNAME",
                predefined: true,
                private: false,
                readonly: false,
                type: "string",
                value: 'Jon'
            },
            {
                name: "LASTNAME",
                predefined: true,
                private: false,
                readonly: false,
                type: "string",
                value: 'Snow'
            },
            {
                name: "Empresa",
                predefined: false,
                private: true,
                readonly: false,
                type: "string",
                value: 'Winterfell'
            }
          ]
        }
    );

    expect(fetchStub).to.be.calledWithExactly('https://restapi.fromdoppler.com/accounts/user%40example.com/lists/178945/subscribers',
        { body: expectedRequestBody, method: 'POST', headers: { Authorization: "token C22CADA13759DB9BBDF93B9D87C14D5A" } });
  });
});