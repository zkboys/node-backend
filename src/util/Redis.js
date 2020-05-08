// module.exports = require('ioredis');

const {RedisStorage} = require('../entities');

// Redis 实现，使用数据库，如果想使用真实的Redis，直接导出 ioredis
module.exports = class Redis {
    async get(key) {
        if (!key) return null;
        const result = await RedisStorage.findOne({where: {key}});

        return result ? JSON.parse(result.value).value : result;
    }

    async set(key, value) {
        const val = JSON.stringify({value});
        const result = await RedisStorage.findOne({where: {key}});
        if (result) {
            await RedisStorage.update({value: val}, {where: {id: result.id}});
        } else {
            await RedisStorage.create({key, value: val});
        }
    }

    async del(key) {
        await RedisStorage.destroy({where: {key}});
    }
};
