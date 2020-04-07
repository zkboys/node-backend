'use strict';

const spt = require('../support');

describe('test/controllers/user.test.js', () => {
    let request;
    afterAll(() => spt.clean());
    beforeAll(async () => {
        request = await spt.createLoginRequest();
    });

    describe('register', () => {
        test('参数验证', async () => {
            const res = await request('/api/register', 'post');

            expect(res.body.message).toBe('用户名不能为空');
        });

        // test('注册用户', async () => {
        //     await request('/api/register', 'post')
        //         .send({account: 'test1', password: '123456'})
        //         .expect(200, 'OK');
        // });

        test('重复注册', async () => {
            const res = await request('/api/register', 'post')
                .send({account: 'test1', password: '123456'})
                .expect(400);

            expect(res.body.message).toBe('账号已被使用');
        });
    });

    describe('login', () => {
        test('参数验证', async () => {
            const res = await request('/api/login', 'post');

            expect(res.body.message).toBe('用户名不能为空');
        });

        test('登录', async () => {
            const res = await request('/api/login', 'post')
                .send({account: 'test1', password: '123456'});

            expect(res.body.account).toBe('test1');
        });

        test('用户名错误', async () => {
            const res = await request('/api/login', 'post')
                .send({account: 'te2st', password: '123456'});

            expect(res.body.message).toBe('用户名或密码错误');
        });

        test('密码错误', async () => {
            const res = await request('/api/login', 'post')
                .send({account: 'test1', password: '1234567'});

            expect(res.body.message).toBe('用户名或密码错误');
        });
    });

    describe('users', () => {
        test('查询所有用户', async () => {
            const res = await request('/api/users');

            expect(res.body).toHaveLength(4);
        });
    });
});
