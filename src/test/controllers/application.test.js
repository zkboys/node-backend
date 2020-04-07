'use strict';

const spt = require('../support');

describe('test/controllers/application.test.js', () => {
    let request;
    afterAll(() => spt.clean());
    beforeAll(async () => {
        request = await spt.createLoginRequest();
    });

    describe('search', () => {
        test('结果验证', async () => {
            // const keyWord = 'NEWZABBIX_151.15';
            // const keyWord = 'ABC-QRCODE-ADMIN';
            // const keyWord = 'HEIMDALL';
            const keyWord = 'ICP-NOTICE';
            const res = await request('/api/app/search?keyWord=' + keyWord, 'get');
            expect(res.body).toHaveProperty('apps');
        });
    });
});
