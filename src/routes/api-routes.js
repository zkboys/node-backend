const Router = require('koa-router');
const inflection = require('inflection');
const {apiBasePath = ''} = require('config');
const apiRouter = new Router({prefix: apiBasePath});

const {
    Util,
    RestFull,
} = require('../controllers');

const getEntityModel = (type) => (ctx, next) => {
    const {model} = ctx.params;

    // 路径不是复数，不符合restful规范，忽略
    if (inflection.pluralize(model) !== model) ctx.throw(404, 'Not Found');

    const entityName = inflection.camelize(inflection.singularize(model));
    const entity = ctx.$entity[entityName];
    // 路径无对应的实体
    if (!entity) ctx.throw(404, 'Not Found');

    const {entityConfig: {commonApi}} = entity;

    if (!commonApi) ctx.throw(404, 'Not Found');

    if (Array.isArray(commonApi) && !commonApi.includes(type)) {
        ctx.throw(404, 'Not Found');
    }

    ctx.$entityModel = entity;
    return next();
};

module.exports = apiRouter
    .post('/upload', Util.upload)
    .get('/swagger.json', (ctx) => {
        ctx.success(require('./swagger-json').swaggerJson);
    })

    // 通用 restful api 放到最后
    .get('/:model', getEntityModel('findAll'), RestFull.findAll) // 查询全部 或分页查询
    .get('/one/:model', getEntityModel('findOne'), RestFull.findOne) // 根据条件查询详情
    .get('/:model/:id', getEntityModel('findById'), RestFull.findById) // 根据id查询详情
    .post('/:model', getEntityModel('save'), RestFull.save) // 添加
    .put('/:model', getEntityModel('update'), RestFull.update) // 修改
    .del('/:model/:id', getEntityModel('deleteById'), RestFull.deleteById) // 根据id删除
    .del('/:model', getEntityModel('deleteByIds'), RestFull.deleteByIds) // 根据ids批量删除
    .post('*', ctx => (ctx.status = 404))
    .put('*', ctx => (ctx.status = 404))
    .del('*', ctx => (ctx.status = 404))
;
