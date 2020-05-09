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
        // html 页面请求，返回首页
        if (ctx.headers.accept.startsWith('text/html')) {
            ctx.type = 'html';
            ctx.body = fs.createReadStream(path.resolve(__dirname, '../../dist/index.html'));
            return;
        }

        // 其他请求返回404
        ctx.status = 404;
    });
