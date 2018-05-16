module.exports = {
    IMPORT_SUBSCRIBERS_PAYLOAD:{
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
        callback: "https://shopify.fromdoppler.com/hooks/doppler-import-completed?shop=store.myshopify.com",
        enableEmailNotification: true
      }
}