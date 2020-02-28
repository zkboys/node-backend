const Router = require('koa-router');
const fs = require('fs');
const path = require('path');
const {
    user,
    util,
} = require('../controllers');

const apiRouter = new Router({prefix: '/api'});
const pageRouter = new Router({prefix: ''});

// ctx.state 可以给模版传递数据
exports.page = pageRouter
    .get('/register', renderPage('register'))
    .get('*', ctx => { // 单页面应用，所有未捕获请求，返回index.html
        // TODO 区分ajax请求、静态文件请求，否者都会返回index.html
        ctx.type = 'html';
        ctx.body = fs.createReadStream(path.resolve(__dirname, '../../dist/index.html'));
    });

exports.api = apiRouter
    .get('/wallpaper', util.wallpaper)
    .post('/upload', util.upload)

    .post('/login', user.login)
    .post('/logout', user.logout)
    .post('/register', user.register)
    .get('/users', user.findAll)
;

function renderPage(page) {
    return async function (ctx) {
        await ctx.render(page);
    };
}
