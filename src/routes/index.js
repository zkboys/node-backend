const Router = require('koa-router');
const {
    user,
    util,
} = require('../controllers');

const apiRouter = new Router({prefix: '/api'});
const pageRouter = new Router({prefix: ''});

// ctx.state 可以给模版传递数据
exports.page = pageRouter
    .get('/', renderPage('index'))
    .get('/register', renderPage('register'));

exports.api = apiRouter
    .get('/wallpaper', util.wallpaper)
    .post('/upload', util.upload)

    .post('/login', user.login)
    .post('/register', user.register)
    .get('/users', user.findAll)
;

function renderPage(page) {
    return async function (ctx) {
        await ctx.render(page);
    };
}
