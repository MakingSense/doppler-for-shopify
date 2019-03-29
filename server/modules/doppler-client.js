const querystring = require('querystring');
const shopify = require('./shopify-extras');
const baseUrl = 'https://restapi.fromdoppler.com';

class DopplerApiError extends Error {
  constructor(statusCode, errorCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

const getCustomerFieldValue = function(customer, fieldPath) {
  let currentProperty = customer;

  fieldPath.split('.').forEach(propertyName => {
    if (typeof(currentProperty) == "undefined") 
      return null;
    currentProperty = currentProperty[propertyName];
  });

  return currentProperty;
};

const sendRequestAsync = async function(fetch, url, fetchOptions) {
  const response = await fetch(url, fetchOptions);
  const responseBody = await response.json();

  if (response.status >= 400) {
    const msg =
      responseBody && (responseBody.title || responseBody.detail)
        ? `${responseBody.title ? `${responseBody.title}: ` : ''}${
            responseBody.detail ? responseBody.detail : ''
          }`
        : 'Unexpected error';

    const errorCode = responseBody ? responseBody.errorCode : null;
    throw new DopplerApiError(response.status, errorCode, msg);
  }

  return responseBody;
};

class Doppler {
  constructor(fetch, accountName, apiKey) {
    this.fetch = fetch;
    this.accountName = querystring.escape(accountName);
    this.apiKey = apiKey;
  }

  async AreCredentialsValidAsync() {
    const url = `${baseUrl}/accounts/${this.accountName}`;

    try {
      await sendRequestAsync(this.fetch, url, {
        headers: { Authorization: `token ${this.apiKey}` },
      });
      return true;
    } catch (error) {
      if (!error.statusCode)
        throw new Error('Unexpected error calling Doppler API');
      if (error.statusCode === 500) throw error;
      return false;
    }
  }

  async getListsAsync() {
    const url = `${baseUrl}/accounts/${
      this.accountName
    }/lists?page=1&per_page=200&state=active`;
    const responseBody = await sendRequestAsync(this.fetch, url, {
      headers: { Authorization: `token ${this.apiKey}` },
    });

    return {
      items: responseBody.items.map(list => {
        return { listId: list.listId, name: list.name };
      }),
      itemsCount: responseBody.itemsCount
    };
  }

  async createListAsync(listName) {
    const url = `${baseUrl}/accounts/${this.accountName}/lists`;

    const responseBody = await sendRequestAsync(this.fetch, url, {
      method: 'POST',
      body: JSON.stringify({ name: listName }),
      headers: { Authorization: `token ${this.apiKey}` },
    });

    return responseBody.createdResourceId;
  }

  async getFieldsAsync() {
    const url = `${baseUrl}/accounts/${this.accountName}/fields`;

    const responseBody = await sendRequestAsync(this.fetch, url, {
      headers: { Authorization: `token ${this.apiKey}` },
    });

    return responseBody.items.map(field => {
      return {
        predefined: field.predefined,
        name: field.name,
        readonly: field.readonly,
        type: field.type,
        sample: field.sample,
        private: field.private,
      };
    });
  }

  // Maybe This method should not be here but in an external "fields-module" or "mapping-module"
  async createFieldsMapping(mapping) {
    const dopplerFields = await this.getFieldsAsync();

    return mapping.map(m => {
      const dopplerField = dopplerFields.find(df => df.name === m.doppler);
      if (!dopplerField)
        throw new Error(
          `Error when mapping Shopify field "${m.shopify}": Doppler field "${
            m.doppler
          }" does not exist.`
        );

      const shopifyField = shopify.customerFields.find(
        cf => cf.path === m.shopify
      );
      if (!shopifyField)
        throw new Error(
          `Error when mapping Shopify field "${
            m.shopify
          }": The field does not exist.`
        );

      if (dopplerField.type !== shopifyField.type)
        throw new Error(
          `Error when mapping Shopify field "${
            shopifyField.name
          }" with Doppler field "${dopplerField.name}": different types.`
        );

      return { ...dopplerField, value: shopifyField.path };
    });
  }

  async getListAsync(listId) {
    return await sendRequestAsync(this.fetch, 
      `${baseUrl}/accounts/${this.accountName}/lists/${listId}`, {
      method: 'GET',
      headers: { Authorization: `token ${this.apiKey}`}
    });
  }

  async getAllDopplerSubscribers(listId) {
    let subscribers = [];
    let pageNumber = 1
    let responseBody = null;
    do {
      responseBody = await sendRequestAsync(this.fetch, 
        `${baseUrl}/accounts/${this.accountName}/lists/${listId}/subscribers?page=${pageNumber}&per_page=100`, {
        method: 'GET',
        headers: { Authorization: `token ${this.apiKey}`}
      });
      subscribers = subscribers.concat(responseBody.items);
      pageNumber++;

    } while (pageNumber <= responseBody.pagesCount);

    return subscribers;
  }

  async disassociateSubscribersFromList(customers, listId) {
    try {
      (await this.getAllDopplerSubscribers(listId))
        .filter(s => !customers.some(c => c.email === s.email))
        .forEach(async s => { 
          await sendRequestAsync(this.fetch, 
            `${baseUrl}/accounts/${this.accountName}/lists/${listId}/subscribers/${s.email}`, {
            method: 'DELETE',
            headers: { Authorization: `token ${this.apiKey}`}
          });
        }
        );

    } catch (error) {
      console.debug(error);
    }
  }

  async importSubscribersAsync(customers, listId, shopDomain, fieldsMap) {
    if (customers.length === 0) return null;
    
    await this.disassociateSubscribersFromList(customers, listId);

    const url = `${baseUrl}/accounts/${this.accountName}/lists/${listId}/subscribers/import`;

    const subscribers = {
      items: customers.map(customer => {
        return {
          email: customer.email,
          fields:
            fieldsMap.length > 0
              ? fieldsMap.map(m => {
                  return {
                    name: m.doppler,
                    value: getCustomerFieldValue(customer, m.shopify),
                  };
                }).filter(f => f.value != null)
              : [],
        };
      }),
      fields: fieldsMap.length > 0 ? fieldsMap.map(m => m.doppler) : [],
      callback: `${
        process.env.SHOPIFY_APP_HOST
      }/hooks/doppler-import-completed?shop=${querystring.escape(shopDomain)}`,
      enableEmailNotification: true,
    };

    const responseBody = await sendRequestAsync(this.fetch, url, {
      method: 'POST',
      body: JSON.stringify(subscribers),
      headers: { Authorization: `token ${this.apiKey}`, "X-Doppler-Subscriber-Origin": "Shopify" },
    });

    return responseBody.createdResourceId;
  }

  async createSubscriberAsync(customer, listId, fieldsMap) {
    const url = `${baseUrl}/accounts/${this.accountName}/lists/${
      listId
    }/subscribers`;

    const subscriber = {
      email: customer.email,
      fields:
        fieldsMap.length > 0
          ? fieldsMap.map(m => {
              return {
                name: m.doppler,
                value: getCustomerFieldValue(customer, m.shopify),
              };
            }).filter(f => f.value != null)
          : [],
    };

    await sendRequestAsync(this.fetch, url, {
      method: 'POST',
      body: JSON.stringify(subscriber),
      headers: { Authorization: `token ${this.apiKey}`, "X-Doppler-Subscriber-Origin": "Shopify" },
    });
  }

  async getImportTaskAsync(taskId) {
    const url = `${baseUrl}/accounts/${this.accountName}/tasks/${taskId}`;

    const responseBody = await sendRequestAsync(this.fetch, url, {
      headers: { Authorization: `token ${this.apiKey}` },
    });

    return responseBody.importDetails;
  }
}

class DopplerFactory {
  constructor(fetch) {
    this.fetch = fetch;
  }

  createClient(accountName, apiKey) {
    return new Doppler(this.fetch, accountName, apiKey);
  }
}

module.exports = fetch => {
  return new DopplerFactory(fetch);
};
