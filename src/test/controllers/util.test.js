'use strict';

const fs = require('fs');
const path = require('path');
const config = require('config');
const spt = require('../support');

describe('test/controllers/util.test.js', () => {
    let request;
    afterAll(() => spt.clean());
    beforeAll(async () => {
        request = await spt.createLoginRequest();
    });

    describe('upload', () => {
        const uploadConf = config.get('upload');
        test('文件类型错误', async () => {
            const res = await request('/api/upload', 'post')
                .attach('file', Buffer.from('upload'), 'upload.js');

            expect(res.body.message).toBe(`上传失败，仅支持 ${uploadConf.types.join('/').replace(/\./g, '')} 文件类型`);
        });

        test('大小限制', async () => {
            const res = await request('/api/upload', 'post')
                .attach('file', Buffer.alloc(uploadConf.size + 1), 'upload.jpg');

            expect(res.body.message).toBe('上传失败，超过限定大小');
        });

        test('图片上传', async () => {
            const res = await request('/api/upload', 'post')
                .attach('file', Buffer.from('upload'), 'upload.jpg');

            const data = res.body;
            const filePath = path.resolve(__dirname, '../../config', uploadConf.dir, data.path.match(/\/upload\/(.*)/)[1]);

            // expect(data.expire).toBe(moment().add(uploadConf.expire.day, 'days').format('YYYY-MM-DD 00:00:00'));
            expect(data.expire).toBe(-1);
            expect(fs.existsSync(filePath)).toBe(true);
        });
    });
});
