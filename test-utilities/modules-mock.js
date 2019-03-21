module.exports = {
    wrappedRedisClient: {
        hmset: function(key, hset, done){},
        quit: function(done){},
        hgetall: function(key, done){},
        del: function(key, done){},
        on: function(done){},
        set: function(key, hset, done){},
        sadd: function(key, hset, done){},
        smembers: function(key, done){},
        srem: function(key, done){}
    },
    redisClient: {
        getShopAsync: async function () {},
        getShopsAsync: async function () {},
        storeShopAsync: async function () {},
        sremAsync: async function () {},
        removeShopAsync: async function () {},
        quitAsync: async function(){}
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
            list: async function () {},
            count: async function () {}
        },
        scriptTag: {
            create: async function () {}
        },
    },
    appController: {
        synchronizeCustomers: async function (request, response) {}
    }
}