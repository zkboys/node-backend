'use strict';
import path from 'path';

const Koa = require('koa');
const config = require('config');
const koaJwt = require('koa-jwt');
const cors = require('@koa/cors');
const koaBody = require('koa-body');
const favicon = require('koa-favicon');
const staticCache = require('koa-static-cache');
const {pathToRegexp} = require('path-to-regexp');

const util = require('./util');
const logger = require('./util/logger');
const middleware = require('./middleware');
const render = require('./middleware/layout-ejs');
const routes = require('./routes');
const {cron} = require('./cron');

const port = config.get('port');
const host = config.get('host');
const ip = util.getIp();
const uploadConf = config.get('upload');
const jwtSecret = config.get('jwt.secret');
const jwtCookieName = config.get('jwt.cookieName');

const app = module.exports = new Koa();

util.init();

render(app, {
    root: path.join(__dirname, 'views'),
    layout: 'layout',
    viewExt: 'ejs',
    cache: false,
    debug: false,
});

// 统一加载自定义中间件
middleware.forEach(fn => {
    app.use(fn(app));
});

app
    .use(favicon(path.join(__dirname, '/public/images/favicon.ico')))
    .use(serveStatic('/dist/static', '../dist/static', {maxAge: 60 * 60 * 24 * 30}))
    .use(serveStatic('/dist', '../dist'))
    .use(serveStatic('/public', './public'))
    .use(serveStatic('/upload', path.resolve(__dirname, 'config', uploadConf.dir)))
    .use(logger)
    .use(cors({
        credentials: true,
        maxAge: 2592000,
    }))
    .use(koaJwt({
        // 获取token的优先级 getToken > cookie > Authorization header
        secret: jwtSecret,
        cookie: jwtCookieName,
        getToken: (ctx) => ctx.state.validateToken,
    }).unless((ctx) => {
        if (/^\/api/.test(ctx.path)) {
            return pathToRegexp([
                '/api/swagger.json',
                '/api/login',
                '/api/register',
                '/api/wallpaper',
                '/api/getCaptcha',
            ]).test(ctx.path);
        }
        return true;
    }))
    .use(koaBody({
        multipart: true,
        formidable: {
            maxFileSize: 200 * 1024 * 1024,
        },
    }))
    .use(routes.decorator.routes())
    .use(routes.decorator.allowedMethods())
    .use(routes.api.routes())
    .use(routes.api.allowedMethods())
    .use(routes.page.routes())
    .use(routes.page.allowedMethods());

app.proxy = config.get('proxy');

// FIXME HTTPS 方式启动
/* istanbul ignore if */
if (!module.parent) {
    cron.start();
    // app.listen(port, host);
    app.listen(port);
    console.log(`server started at http://${host}:${port} http://${ip}:${port}`);
}

function serveStatic(prefix, filePath, options = {}) {
    return staticCache(path.resolve(__dirname, filePath), {
        prefix: prefix,
        gzip: true,
        dynamic: true,
        ...options,
    });
}
