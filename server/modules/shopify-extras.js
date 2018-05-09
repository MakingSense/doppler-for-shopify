const ShopifyAPIClient = require('shopify-api-node');

class ShopifyAPIClientFactory {
  createClient(shopDomain, accessToken) {
    return new ShopifyAPIClient({ shopName: shopDomain, accessToken: accessToken });
  }
}

module.exports = {
 customerFields: [
      {
        name: 'Id',
        path: 'id', 
        sample: 207119551,
        type: 'number'
      },
      {
        name: 'Accepts Marketing',
        path: 'accepts_marketing', 
        sample: false,
        type: 'boolean'
      },
      {
        name: 'Created At',
        path: 'created_at', 
        sample: '2018-04-27T15:15:25-04:00',
        type: 'string'
      },
      {
        name: 'Updated At',
        path: 'updated_at', 
        sample: '2018-04-27T15:15:25-04:00',
        type: 'string'
      },
      {
        name: 'First Name',
        path: 'first_name', 
        sample: 'Bob',
        type: 'string'
      },
      {
        name: 'Last Name',
        path: 'last_name',
        sample: 'Norman',
        type: 'string'
      },
      {
        name: 'Orders Count',
        path: 'orders_count', 
        sample: 1,
        type: 'number'
      },
      {
        name: 'State',
        path: 'state', 
        sample: 'disabled',
        type: 'string'
      },
      {
        name: 'Total Spent',
        path: 'total_spent', 
        sample: '41.94',
        type: 'string'
      },
      {
        name: 'Last Order Id',
        path: 'last_order_id', 
        sample: 450789469,
        type: 'number'
      },
      {
        name: 'Note',
        path: 'note', 
        sample: 'Very nice customer',
        type: 'string'
      },
      {
        name: 'Verified Email',
        path: 'verified_email', 
        sample: true,
        type: 'boolean'
      },
      {
        name: 'Multipass Identifier',
        path: 'multipass_identifier', 
        sample: null,
        type: 'string'
      },
      {
        name: 'Tax Exempt',
        path: 'tax_exempt', 
        sample: false,
        type: 'boolean'
      },
      {
        name: 'Phone',
        path: 'phone', 
        sample: '5492235783541',
        type: 'string'
      },
      {
        name: 'tags',
        path: 'tags', 
        sample: 'tag1, tag2',
        type: 'string'
      },
      {
        name: 'Last Order Name',
        path: 'last_order_name',
        sample: '#1001',
        type: 'string'
      },
      {
        name: 'Address Id',
        path: 'default_address.id',
        sample: 698282278973,
        type: 'number'
      },
      {
        name: 'Address First Name',
        path: 'default_address.first_name',
        sample: 'Juan',
        type: 'string'
      },
      {
        name: 'Address Last Name',
        path: 'default_address.last_name',
        sample: 'Perez',
        type: 'string'
      },
      {
        name: 'Company',
        path: 'default_address.company',
        sample: 'Making Sense',
        type: 'string'
      },
      {
        name: 'Address 1',
        path: 'default_address.address1',
        sample: 'Formosa 278',
        type: 'string'
      },
      {
        name: 'Address 2',
        path: 'default_address.address2',
        sample: 'Garay 2828',
        type: 'string'
      },
      {
        name: 'City',
        path: 'default_address.city',
        sample: 'Mar Del Plata',
        type: 'string'
      },
      {
        name: 'Province',
        path: 'default_address.province',
        sample: 'Buenos Aires',
        type: 'string'
      },
      {
        name: 'Country',
        path: 'default_address.country',
        sample: 'Argentina',
        type: 'string'
      },
      {
        name: 'Zip',
        path: 'default_address.zip',
        sample: '7600',
        type: 'string'
      },
      {
        name: 'Phone',
        path: 'default_address.phone',
        sample: '1234567890',
        type: 'string'
      },
      {
        name: 'Address Name',
        path: 'default_address.name',
        sample: 'Juan Perez',
        type: 'string'
      },
      {
        name: 'Province Code',
        path: 'default_address.province_code',
        sample: 'B',
        type: 'string'
      },
      {
        name: 'Country Name',
        path: 'default_address.country_code',
        sample: 'AR',
        type: 'country'
      },
      {
        name: 'Country Name',
        path: 'default_address.country_name',
        sample: 'Argentina',
        type: 'string'
      }
  ],
  shopifyAPIClientFactory: ShopifyAPIClientFactory
}

