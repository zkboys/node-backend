const Router = require('koa-router');
const fs = require('fs');
const path = require('path');

const apiRouter = new Router({prefix: '/api'});
const pageRouter = new Router({prefix: ''});

const {
    Util,
} = require('../controllers');

function method(methodName = 'get') {
    return function (path) {
        return function (target, name, descriptor) {
            const prefixPath = target.routePrefix ? `/${target.routePrefix}${path}` : `${path}`;

            // 需要进行bind ，否则会导致方法内部的this丢失
            descriptor.value = descriptor.value.bind(target);

            apiRouter[methodName](prefixPath, descriptor.value);

            return descriptor;
        };
    };
}

export function Get(path) {
    return method('get')(path);
}

export function Post(path) {
    return method('post')(path);
}

export function Put(path) {
    return method('put')(path);
}

export function Del(path) {
    return method('del')(path);
}

export const api = apiRouter
    .post('/upload', Util.upload)
    .post('*', ctx => (ctx.status = 404))
    .put('*', ctx => (ctx.status = 404))
    .del('*', ctx => (ctx.status = 404))
;

const renderPage = (page) => async ctx => await ctx.render(page);
// ctx.state 可以给模版传递数据
export const page = pageRouter
    .get('/index', renderPage('index'))
    .get('*', ctx => { // 单页面应用，所有未捕获请求，返回index.html
        // 区分ajax请求、静态文件请求，否者都会返回index.html
        if (ctx.headers['x-requested-with'] === 'XMLHttpRequest' && ctx.path.startsWith('/api/')) {
            ctx.status = 404;
            return;
        }

        // 静态文件
        if (ctx.path.startsWith('/dist/')) {
            ctx.status = 404;
            return;
        }

        ctx.type = 'html';
        ctx.body = fs.createReadStream(path.resolve(__dirname, '../../dist/index.html'));
    });
