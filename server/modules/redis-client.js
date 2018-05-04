const { promisify } = require('util');
const redis = require('redis');

class Redis {
    constructor() {
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

    async storeShop(shopDomain, shop, closeConnection) {
        try {
            await this.client.hmsetAsync(shopDomain, shop);
        }
        catch (error) {
            console.error(`Error storing shop ${shopDomain}: ${error.message}`);
            throw error;
        } finally {
            if (closeConnection)
                await this.client.quitAsync();
        }
    }

    async getShop(shopDomain, closeConnection) {
        try {
            return await this.client.hgetallAsync(shopDomain);
        }
        catch (error) {
            console.error(`Error retrieving shop ${shopDomain}: ${error.message}`);
            throw error;
        } finally {
            if (closeConnection)
                await this.client.quitAsync();
        }

    }

    async removeShop(shopDomain, closeConnection) {
        try {
            await this.client.delAsync(shopDomain);
        }
        catch (error) {
            console.error(`Error removing shop ${shopDomain}: ${error.message}`);
            throw error;
        } finally {
            if (closeConnection)
                await this.client.quitAsync();
        }
    }
}

module.exports = Redis
