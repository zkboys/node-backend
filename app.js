'use strict';

const path = require('path');
const Koa = require('koa');
const config = require('config');
const koaJwt = require('koa-jwt');
const cors = require('@koa/cors');
const koaBody = require('koa-body');
// const onerror = require('koa-onerror');
const favicon = require('koa-favicon');
// const validate = require('koa-validate');
const staticCache = require('koa-static-cache');
const {pathToRegexp} = require('path-to-regexp');

const util = require('./util');
const logger = require('./util/logger');
const middleware = require('./middlewares');
const render = require('./middlewares/layout-ejs');
const validate = require('./middlewares/validate');
const zhCn = require('./middlewares/validate/i18n/zh-cn');

const routerConfig = require('./router-config');

const app = module.exports = new Koa();
const uploadConf = config.get('upload');
const jwtSecret = config.get('jwt.secret');

util.init();
// onerror(app);
validate(app, zhCn);

render(app, {
    root: path.join(__dirname, 'views'),
    layout: 'layout',
    viewExt: 'ejs',
    cache: false,
    debug: false,
});

app
    .use(middleware.util)
    .use(middleware.ipFilter)
    .use(favicon(path.join(__dirname, '/public/images/icon.png')))
    .use(serveStatic('/dist', './dist'))
    .use(serveStatic('/public', './public'))
    .use(serveStatic('/upload', path.resolve(__dirname, 'config', uploadConf.dir)))
    .use(logger)
    .use(cors({
        credentials: true,
        maxAge: 2592000,
    }))
    .use(koaJwt({secret: jwtSecret}).unless((ctx) => {
        if (/^\/api/.test(ctx.path)) {
            return pathToRegexp([
                '/api/u/login',
                '/api/u/register',
                '/api/mock/by_projects',
                '/api/mock/export',
                '/api/wallpaper',
            ]).test(ctx.path);
        }
        return true;
    }))
    .use(koaBody({multipart: true}))
    .use(routerConfig.mock.routes())
    .use(routerConfig.mock.allowedMethods())
    .use(routerConfig.api.routes())
    .use(routerConfig.api.allowedMethods())
    .use(routerConfig.page.routes())
    .use(routerConfig.page.allowedMethods());

app.proxy = config.get('proxy');

// FIXME HTTPS 方式启动
/* istanbul ignore if */
if (!module.parent) {
    const port = config.get('port');
    const host = config.get('host');
    app.listen(port, host);
    console.log(`server started at http://${host}:${port}`);
}

function serveStatic(prefix, filePath) {
    return staticCache(path.resolve(__dirname, filePath), {
        prefix: prefix,
        gzip: true,
        dynamic: true,
        // FIXME 静态文件缓存怎么设置
        // maxAge: 60 * 60 * 24 * 30,
    });
}
