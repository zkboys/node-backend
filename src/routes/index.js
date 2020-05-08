const Router = require('koa-router');
const fs = require('fs');
const path = require('path');
const inflection = require('inflection');

const apiRouter = new Router({prefix: '/api'});
const pageRouter = new Router({prefix: ''});

const {
    Util,
    RestFull,
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

export function Get(...args) {
    return method('get')(...args);
}

export function Post(...args) {
    return method('post')(...args);
}

export function Put(...args) {
    return method('put')(...args);
}

export function Del(...args) {
    return method('del')(...args);
}

function getEntityModel(ctx, next) {
    const {model} = ctx.params;
    const entityName = inflection.camelize(inflection.singularize(model));

    const entity = ctx.$entity[entityName];
    if (!entity) return ctx.fail(`没有${model}对应的entity${entityName}!`);

    ctx.$entityModel = entity;
    return next();
}

export const api = apiRouter
    // 通用 restful api
    .get('/:model', getEntityModel, RestFull.findAll)     // 查询全部 或分页查询
    .get('/one/:model', getEntityModel, RestFull.findOne)    // 根据条件查询详情
    .get('/:model/:id', getEntityModel, RestFull.findById)   // 根据id查询详情
    .post('/:model', getEntityModel, RestFull.save)         // 添加
    .put('/:model', getEntityModel, RestFull.update)           // 修改
    .del('/:model/:id', getEntityModel, RestFull.deleteById)       // 根据id删除
    .del('/:model', getEntityModel, RestFull.deleteByIds)      // 根据ids批量删除

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
