import _ from 'lodash';
import inflection from 'inflection';
import asyncValidator from 'async-validator';
import {promisify} from 'util';


// 通用的rest full 接口
export default class RestFullController {
    // 获取列表
    static async findAll(ctx) {
        const attributes = ctx.$entityModel.tableAttributes;
        const {pageNum, pageSize, ...others} = ctx.query;

        // 查询条件
        const conditions = [];

        // 关联查询
        const include = RestFullController.getInclude(ctx);
        const allFields = Object.keys(attributes);

        // 拼接查询条件
        for (let [key, value] of Object.entries(others)) {

            // 数据库中不含有查询字段
            if (!allFields.includes(key)) {
                // return ctx.fail(`查询条件字段：「${key}」无对应数据库字段！`)
                continue;
            }

            // 也许是id 精确查询
            if (key.endsWith('Id')) {
                // 如果不转换，多对多 关联查询，拼接的sql有问题，可能是 sequelize 框架底层的问题
                key = inflection.underscore(key);
                conditions.push({[key]: value});
            } else {
                // 模糊查询
                key = inflection.underscore(key);
                conditions.push({[key]: {$like: `%${value.trim()}%`}});
            }
        }

        const options = {
            where: {
                $and: [conditions],
            },
            order: [
                ['updatedAt', 'DESC'],
            ],
            include,
        };

        // 含有分页参数，为分页查询
        if (pageNum && pageSize) {
            options.offset = (pageNum - 1) * pageSize;
            options.limit = +pageSize;

            let {count, rows} = await ctx.$entityModel.findAndCountAll(options);
            rows = RestFullController.filter(rows, ctx.$entityModel, include);

            return ctx.success({total: count, list: rows});
        } else {
            let rows = await ctx.$entityModel.findAll(options);
            rows = RestFullController.filter(rows, ctx.$entityModel, include);

            ctx.success(rows);
        }
    }

    // 获取详情
    static async findById(ctx) {
        const {id} = ctx.params;

        // 关联查询
        const include = RestFullController.getInclude(ctx);

        let result = await ctx.$entityModel.findOne({where: {id}, include});
        result = RestFullController.filter(result, ctx.$entityModel, include);

        ctx.success(result);
    }

    // 根据条件 获取详情
    static async findOne(ctx) {
        const attributes = ctx.$entityModel.tableAttributes;
        // 查询条件
        const conditions = [];
        // 关联查询
        const include = RestFullController.getInclude(ctx);
        const allFields = Object.keys(attributes);

        // 拼接查询条件
        for (let [key, value] of Object.entries(ctx.query)) {
            if (!allFields.includes(key)) {
                // return ctx.fail(`查询条件字段：「${key}」无对应数据库字段！`)
                continue;
            }

            key = inflection.underscore(key);

            conditions.push({[key]: value});
        }

        const options = {
            where: {
                $and: [conditions],
            },
            include,
        };

        let result = await ctx.$entityModel.findOne(options);
        result = RestFullController.filter(result, ctx.$entityModel, include);

        ctx.success(result);
    }

    // 新增
    static async save(ctx) {
        const body = ctx.request.body;
        // 可能是批量添加
        const bodyArr = Array.isArray(body) ? body : [body];

        for (const data of bodyArr) {
            const errors = await RestFullController.validateBody(ctx, data);
            if (errors) return ctx.fail(errors);
        }

        const result = await ctx.$entityModel.bulkCreate(bodyArr);
        return ctx.success(result);
    }

    // 修改
    static async update(ctx) {
        const body = ctx.request.body;

        if (!body) return ctx.fail('请传递需要更新的数据');
        if (!body.id) return ctx.fail('需要更新的数据，必须含有「id」');

        const errors = await RestFullController.validateBody(ctx);
        if (errors) return ctx.fail(errors);

        const result = await ctx.$entityModel.update(body, {where: {id: body.id}});
        return ctx.success(result);
    }

    // 删除
    static async deleteById(ctx) {
        const {id} = ctx.params;

        await ctx.$entityModel.destroy({where: {id}});

        return ctx.success();
    }

    // 批量删除删除
    static async deleteByIds(ctx) {
        const {ids} = ctx.query;
        if (!ids) return ctx.fail('请传递需要删除的「ids」，以英文逗号分隔');

        const idArr = ids.split(',');

        await ctx.$entityModel.destroy({where: {id: {$in: idArr}}});

        ctx.success();
    }

    /**
     * 获取关联关系
     * @param ctx
     * @returns {[]}
     */
    static getInclude(ctx) {
        // 可以通过查询参数，控制是否启用关联查询
        const {include = true} = ctx.query;

        if (include !== true && include !== 'true') return undefined;

        const {entityConfig} = ctx.$entityModel;

        const {hasOne, hasMany, belongsTo, belongsToMany} = entityConfig;

        const includeArr = [];

        const keys = ['belongsToMany', 'hasMany'];

        Object.entries({hasOne, hasMany, belongsTo, belongsToMany})
            .forEach(([keyWord, value]) => {
                if (!value) return;
                if (!Array.isArray(value)) value = [value];

                value.forEach(entityName => {
                    if (typeof entityName === 'string') {
                        const _modelName = keys.includes(keyWord) ? inflection.pluralize(entityName) : entityName;

                        includeArr.push({model: ctx.$entity[entityName], _modelName});
                    } else {
                        const {model, through} = entityName;
                        const _modelName = keys.includes(keyWord) ? inflection.pluralize(model) : model;

                        includeArr.push({
                            model: ctx.$entity[model],
                            through: ctx.$entity[through],
                            _modelName,
                        });
                    }
                });
            });
        return includeArr.length ? includeArr : undefined;
    }

    /**
     * 过滤掉不需要给前端显示的字段
     * @param result
     * @param entity
     * @param include
     * @returns {*}
     */
    static filter(result, entity, include) {
        if (!result) return result;

        const {excludeFields} = entity.entityConfig;

        // 当前实体没有忽略字段，并且也没有关联实体，直接返回结果
        if (!excludeFields && !include?.length) return result;

        // 处理单个结果
        const omitItem = (item) => {
            const jsonItem = item.toJSON();
            // 处理关联实体
            if (include?.length) {
                include.forEach(it => {
                    const {model, _modelName} = it;
                    const includeResult = jsonItem[_modelName];

                    if (!includeResult) return;

                    const {excludeFields: efs} = model.entityConfig;
                    jsonItem[_modelName] = Array.isArray(includeResult) ? includeResult.map(item => _.omit(item, efs)) : _.omit(includeResult, efs);
                });
            }

            return _.omit(jsonItem, excludeFields);
        };

        if (Array.isArray(result)) return result.map(omitItem);

        return omitItem(result);
    }

    /**
     * 添加 修改时，校验字段
     * @param ctx
     * @param data
     * @returns {Promise<*>}
     */
    static async validateBody(ctx, data) {
        const body = data || ctx.request.body;
        const attributes = ctx.$entityModel.tableAttributes;
        const {excludeValidateFields = []} = ctx.$entityModel.entityConfig;
        const ignoreFields = ['id', 'createdAt', 'updatedAt', ...excludeValidateFields];
        let errors = [];
        let descriptor = null;

        for (const [field, options] of Object.entries(attributes)) {
            if (!ignoreFields.includes(field)) {
                const {unique, type, comment, rules, allowNull} = options;
                const label = comment || field;
                const value = body[field];
                const id = body.id;

                // 存在rules 校验 配置，使用 https://github.com/yiminghe/async-validator 和ant design 使用的同一个校验库，可做前后端同构
                if (rules?.length) {
                    if(!descriptor) descriptor = {};
                    descriptor[field] = rules;
                }

                // 来自数据库的 必填校验
                if (!value) {
                    if (allowNull === false) {
                        errors.push(`「${label}」不可为空！`);
                    }
                    // value都为空了，直接跳过其他校验
                    continue;
                }

                // 来自数据库的 唯一性校验
                if (unique) {
                    const data = await ctx.$entityModel.findOne({where: {[field]: value}});

                    if (data && data.id !== id) errors.push(`${label}：「${value}」已被占用！`);
                }

                // 来自数据库的 长度校验
                const length = type?.options?.length;
                if (length && value.length > length) {
                    errors.push(`「${label}」长度不能大于${length}`);
                }
            }
        }

        // 存在rules相关校验
        if(descriptor) {
            const validator = new asyncValidator(descriptor);

            try {
                await validator.validate(body);
            } catch (error) {
                const {errors: errs, fields} = error;

                if (errs?.length) {
                    errors = errors.concat(errs);
                } else {
                    // 不知道是什么错误
                    errors.push(error);
                }
            }
        }

        return errors?.length ? errors : null;
    }
};