const Router = require('koa-router');
const fs = require('fs');
const path = require('path');

const pageRouter = new Router({prefix: ''});

// ctx.state 可以给模版传递数据
const renderPage = (page) => async ctx => await ctx.render(page);

module.exports = pageRouter
    .get('/index', renderPage('index'))

    // 单页面应用，所有未捕获请求，返回index.html
    .get('*', ctx => {
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
