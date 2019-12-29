'use strict';

const appFactory = require('./appFactory.js');
const request = require('supertest');
const fs = require('fs');
const path = require('path');

require('should');

describe('koa-validate', function () {
    // this.timeout(100000);
    it('file check ok', function (done) {
        const app = appFactory.create(1);

        app.router.post('/upload', async function (ctx) {
            ctx.checkFile('empty').empty();
            // this.checkFile('file1').empty().contentTypeMatch(/^text/);
            ctx.checkFile('file').empty().contentTypeMatch(/^application\//);
            ctx.checkFile('file1').empty().move(path.join(__dirname, '/temp'), function (file, context) {
            });
            ctx.checkFile('file').notEmpty();
            ctx.checkFile('file').notEmpty().copy(path.join(__dirname, '/tempdir/'), function (file, context) {
            });
            ctx.checkFile('file').notEmpty().copy(__dirname);
            ctx.checkFile('file').notEmpty().copy(function () {
                return path.join(__dirname, '/temp');
            });
            ctx.checkFile('file').notEmpty().fileNameMatch(/^.*.js$/).size(0, 10 * 1024).suffixIn(['js']).copy(function (obj) {
                return path.join(__dirname, '/temp');
            }).delete();
            fs.unlinkSync(path.join(__dirname, '/temp'));
            fs.unlinkSync(path.join(__dirname, '/', path.basename(this.request.body.files.file.path)));
            fs.unlinkSync(path.join(__dirname, '/tempdir/', path.basename(this.request.body.files.file.path)));
            // fs.unlinkSync(__dirname+'/tempdir');
            if (this.errors) {
                this.body = this.errors;
                return;
            }
            this.body = 'ok';
        });

        request(app.listen())
            .post('/upload')
            .attach('file', path.join(__dirname, '/test_checkFile.js'))
            .attach('file1', path.join(__dirname, '/test_checkFile.js'))
            // .attach('file2',__dirname+"/test_checkFile.js")
            .send({type: 'js'})
            .expect(200)
            .expect('ok', done);
    });

    it('file check not ok', function (done) {
        const app = appFactory.create(1);
        app.router.post('/upload', async function (ctx) {
            ctx.checkFile('empty').notEmpty();
            ctx.checkFile('file0').size(10, 10);
            ctx.checkFile('file').size(1024 * 100, 1024 * 1024 * 10);
            ctx.checkFile('file1').size(1024 * 100, 1024 * 1024 * 1024 * 10);
            ctx.checkFile('file2').suffixIn(['png']);
            ctx.checkFile('file3').contentTypeMatch(/^image\/.*$/);
            ctx.checkFile('file4').contentTypeMatch(/^image\/.*$/);
            ctx.checkFile('file5').fileNameMatch(/\.png$/);
            ctx.checkFile('file6').isImageContentType('not image content type.');

            if (this.errors.length === 9) {
                this.body = 'ok';
            } else {
                this.body = 'not ok';
            }
        });

        request(app.listen())
            .post('/upload')
            .attach('file', path.join(__dirname, '/test_checkFile.js'))
            .attach('file0', path.join(__dirname, '/test_checkFile.js'))
            .attach('file1', path.join(__dirname, '/test_checkFile.js'))
            .attach('file2', path.join(__dirname, '/test_checkFile.js'))
            .attach('file3', path.join(__dirname, '/test_checkFile.js'))
            .attach('file4', path.join(__dirname, '/test_checkFile.js'))
            .attach('file5', path.join(__dirname, '/test_checkFile.js'))
            .attach('file5', path.join(__dirname, '/test_checkFile.js'))
            .attach('file6', path.join(__dirname, '/test_checkFile.js'))
            .send({type: 'js'})
            .expect(200)
            .expect('ok', done);
    });
});
