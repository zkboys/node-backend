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

    static login(name, password) {
        return request(app.listen())
            .post('/api/login')
            .send({name, password})
            .then(res => res.body);
    }

    static createUser(name = 'admin6', password = '123') {
        return request(app.listen())
            .post('/api/register')
            .send({name, password})
            .then(() => this.login(name, password));
    }

    static createRequest(server, token) {
        return function (url, method = 'get', ctoken = token) {
            return request(server)[method](url)
                .set('Authorization', 'Bearer ' + ctoken);
        };
    }
}

module.exports = Support;
