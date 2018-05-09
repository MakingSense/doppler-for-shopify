module.exports = {
    redisClient: {
        getShopAsync: async function () {},
        storeShopAsync: async function () {},
        removeShopAsync: async function () {}
    },
    dopplerClient: {
        AreCredentialsValidAsync: async function () {},
        getListsAsync: async function () {},
        createListAsync: async function () {},
        getFieldsAsync: async function () {},
        importSubscribersAsync: async function () {},
        createSubscriberAsync: async function () {}
    },
    shopifyClient: {
        webhook: {
            create: async function () {}
        },
        customer: {
            list: async function () {}
        }
    }
}