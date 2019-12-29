'use strict';

const Koa = require('koa');
const validate = require('../validate');
const router = require('koa-router')();
const koaBody = require('koa-body');

exports.create = function (type) {
    const app = new Koa();
    validate(app);
    if (type === 1) {
        app.use(koaBody({multipart: true, formidable: {keepExtensions: true}}));
    } else {
        app.use(koaBody());
    }
    app.use(async function (ctx, next) {
        try {
            next();
        } catch (err) {
            console.log(err.stack);
            this.app.emit('error', err, this);
        }
    });
    app
        .use(router.routes())
        .use(router.allowedMethods());

    app.router = router;
    return app;
};
