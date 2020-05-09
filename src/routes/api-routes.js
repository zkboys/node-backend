const Router = require('koa-router');
const inflection = require('inflection');

const apiRouter = new Router({prefix: '/api'});

const {
    Util,
    RestFull,
} = require('../controllers');

function getEntityModel(ctx, next) {
    const {model} = ctx.params;

    // 路径不是复数，不符合restful规范，忽略
    if (inflection.pluralize(model) !== model) ctx.throw(404, 'Not Found');

    const entityName = inflection.camelize(inflection.singularize(model));
    const entity = ctx.$entity[entityName];
    // 路径无对应的实体
    if (!entity) ctx.throw(404, 'Not Found');

    const {entityConfig: {commonApi = true}} = entity;

    console.log(entity.entityConfig);

    if (!commonApi) ctx.throw(404, 'Not Found');

    ctx.$entityModel = entity;
    return next();
}

module.exports = apiRouter
    .post('/upload', Util.upload)

    // 通用 restful api 放到最后
    .get('/:model', getEntityModel, RestFull.findAll) // 查询全部 或分页查询
    .get('/one/:model', getEntityModel, RestFull.findOne) // 根据条件查询详情
    .get('/:model/:id', getEntityModel, RestFull.findById) // 根据id查询详情
    .post('/:model', getEntityModel, RestFull.save) // 添加
    .put('/:model', getEntityModel, RestFull.update) // 修改
    .del('/:model/:id', getEntityModel, RestFull.deleteById) // 根据id删除
    .del('/:model', getEntityModel, RestFull.deleteByIds) // 根据ids批量删除
    .post('*', ctx => (ctx.status = 404))
    .put('*', ctx => (ctx.status = 404))
    .del('*', ctx => (ctx.status = 404))
;
