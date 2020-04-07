'use strict';

const request = require('supertest');

const app = require('../app');

// const models = require('../models');

class Support {
    // static cleanCollections() {
    //     Object.keys(models).forEach((key) => {
    //         models[key].remove({}).exec();
    //     });
    // }

    static async clean() {
        // TODO 测试的一些清除工作
    }

    static async login(account, password) {
        return request(app.listen())
            .post('/api/login')
            .send({account, password})
            .then(res => res.body);
    }

    static createUser(account = 'admin6', password = '123') {
        return request(app.listen())
            .post('/api/register')
            .send({account, password})
            .then(() => this.login(account, password));
    }

    static createRequest(server, token) {
        return function (url, method = 'get', ctoken = token) {
            return request(server)[method](url)
                .set('Authorization', 'Bearer ' + ctoken);
        };
    }

    static async createLoginRequest(account = 'admin', password = '111') {
        const user = await this.login(account, password);
        return this.createRequest(app.listen(), user.token);
    }
}

module.exports = Support;
