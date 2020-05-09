const Router = require('koa-router');
const inflection = require('inflection');

const apiRouter = new Router({prefix: '/api'});

const {
    Util,
    RestFull,
} = require('../controllers');

function getEntityModel(ctx, next) {
    const {model} = ctx.params;
    const entityName = inflection.camelize(inflection.singularize(model));

    const entity = ctx.$entity[entityName];
    if (!entity) ctx.throw(404, 'Not Found');

    ctx.$entityModel = entity;
    return next();
}

module.exports = apiRouter
    // 通用 restful api
    .get('/:model', getEntityModel, RestFull.findAll) // 查询全部 或分页查询
    .get('/one/:model', getEntityModel, RestFull.findOne) // 根据条件查询详情
    .get('/:model/:id', getEntityModel, RestFull.findById) // 根据id查询详情
    .post('/:model', getEntityModel, RestFull.save) // 添加
    .put('/:model', getEntityModel, RestFull.update) // 修改
    .del('/:model/:id', getEntityModel, RestFull.deleteById) // 根据id删除
    .del('/:model', getEntityModel, RestFull.deleteByIds) // 根据ids批量删除

    .post('/upload', Util.upload)
    .post('*', ctx => (ctx.status = 404))
    .put('*', ctx => (ctx.status = 404))
    .del('*', ctx => (ctx.status = 404))
;
