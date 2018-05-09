const { promisify } = require('util');

class Redis {
    constructor(redis) {
        const options = {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT),
            password: process.env.REDIS_PASSWORD   
        };

        const wrappedClient = redis.createClient(options);
        wrappedClient.on('connect', function() {
            console.info(`Connected to Redis: ${options.host}:${options.port}`);
        });;

        this.client =  {
            hgetallAsync: promisify(wrappedClient.hgetall).bind(wrappedClient),
            hmsetAsync: promisify(wrappedClient.hmset).bind(wrappedClient),
            delAsync: promisify(wrappedClient.del).bind(wrappedClient),
            quitAsync: promisify(wrappedClient.quit).bind(wrappedClient)
        }
    }

    async storeShopAsync(shopDomain, shop, closeConnection) {
        try {
            await this.client.hmsetAsync(shopDomain, shop);
        }
        catch (error) {
            throw new Error(`Error storing shop ${shopDomain}. ${error.toString()}`);
        } finally {
            if (closeConnection)
                await this.client.quitAsync();
        }
    }

    async getShopAsync(shopDomain, closeConnection) {
        try {
            return await this.client.hgetallAsync(shopDomain);
        }
        catch (error) {
            throw new Error(`Error retrieving shop ${shopDomain}. ${error.toString()}`);
        } finally {
            if (closeConnection)
                await this.client.quitAsync();
        }

    }

    async removeShopAsync(shopDomain, closeConnection) {
        try {
            await this.client.delAsync(shopDomain);
        }
        catch (error) {
            throw new Error(`Error removing shop ${shopDomain}. ${error.toString()}`);
        } finally {
            if (closeConnection)
                await this.client.quitAsync();
        }
    }
}

class RedisFactory {
    constructor(redis) {
        this.redis = redis;
    }

    createClient() {
        return new Redis(this.redis);
    }
}

module.exports = (redis) => { return new RedisFactory(redis); }

