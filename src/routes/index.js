const Router = require('koa-router');
const fs = require('fs');
const path = require('path');

const apiRouter = new Router({prefix: '/api'});
const pageRouter = new Router({prefix: ''});

const {
    util,
} = require('../controllers');

function method(methodName = 'get') {
    return path => (target, name, descriptor) => {
        const prefix = target.routePrefix ? `/${target.routePrefix}` : '';

        if (!path) {
            path = `${prefix}/${name}`;
        } else {
            path = `${prefix}${path}`;
        }
        const {value} = descriptor;
        apiRouter[methodName](path, value);
        return descriptor;
    };
}

// export function get(path) {
//     return (target, name, descriptor) => {
//         const {value} = descriptor;
//         apiRouter['get'](path, value);
//         return descriptor;
//     };
// }

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
        .get('/wallpaper', util.wallpaper)
        .post('/upload', util.upload)
        .post('*', ctx => (ctx.status = 404))
        .put('*', ctx => (ctx.status = 404))
        .del('*', ctx => (ctx.status = 404))

    // .post('/login', user.login)
    // .post('/logout', user.logout)
    // .post('/register', user.register)
    // .get('/users', user.findAll)
;

// ctx.state 可以给模版传递数据
export const page = pageRouter
    .get('/register', renderPage('register'))
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

function renderPage(page) {
    return async function (ctx) {
        await ctx.render(page);
    };
}
