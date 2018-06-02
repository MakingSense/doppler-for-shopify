module.exports = {
    IMPORT_SUBSCRIBERS_PAYLOAD:{
        items: [
          {
            email: "jonsnow@example.com",
            fields: [
             {
                name: "FIRSTNAME",
                value: 'Jon'
              },
              {
                name: "LASTNAME",
                value: 'Snow'
              },
              {
                name: "Empresa",
                value: 'Winterfell'
              }
            ]
          },
          {
            email: "nickrivers@example.com",
            fields: [
             {
                name: "FIRSTNAME",
                value: 'Nick'
              },
              {
                name: "LASTNAME",
                value: 'Rivers'
              },
              {
                name: "Empresa",
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