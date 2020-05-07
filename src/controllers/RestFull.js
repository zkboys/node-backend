import _ from 'lodash';
import I from 'i';

const inflect = I();

// 通用的rest full 接口
export default class RestFullController {

    // 获取列表
    static async get(ctx) {
        const attributes = ctx.$entityModel.tableAttributes;
        const {pageNum, pageSize, ...others} = ctx.query;

        // 查询条件
        const conditions = [];

        // 关联查询
        const include = RestFullController.getInclude(ctx);

        const allFields = Object.keys(attributes);

        // 拼接查询条件
        for (const [key, value] of Object.entries(others)) {
            if (!allFields.includes(key)) return ctx.fail(`查询条件字段：「${key}」无对应数据库字段！`);

            // 也许是id 精确查询
            if (key.endsWith('Id')) {
                conditions.push({[key]: value});
            } else {
                // 模糊查询
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

    //  获取详情
    static async getById(ctx) {
        const {id} = ctx.params;

        // 关联查询
        const include = RestFullController.getInclude(ctx);

        let result = await ctx.$entityModel.findOne({where: {id}, include});

        result = RestFullController.filter(result, ctx.$entityModel, include);

        ctx.success(result);
    }

    // 新增
    static async post(ctx) {
        const body = ctx.request.body;

        // 有可能是批量添加
        if (Array.isArray(body)) {
            for (const data of body) {
                const errors = await RestFullController.validateBody(ctx, data);
                if (errors) return ctx.fail(errors);
            }

            const result = await ctx.$entityModel.bulkCreate(body);
            return ctx.success(result);
        }

        const errors = await RestFullController.validateBody(ctx);
        if (errors) return ctx.fail(errors);

        const result = await ctx.$entityModel.create(body);
        ctx.success(result);
    }

    // 修改
    static async put(ctx) {
        const body = ctx.request.body;
        const errors = await RestFullController.validateBody(ctx);
        if (errors) return ctx.fail(errors);

        const result = await ctx.$entityModel.update(body, {where: {id: body.id}});
        ctx.success(result);
    }

    // 删除
    static async del(ctx) {
        const {id} = ctx.params;

        await ctx.$entityModel.destroy({where: {id}});

        ctx.success();
    }

    /**
     * 获取关联关系
     * @param ctx
     * @returns {[]}
     */
    static getInclude(ctx) {
        const {tableAttributes: attributes, entityConfig: {belongsToMany}} = ctx.$entityModel;
        const include = [];

        Object.entries(attributes).forEach(([field, config]) => {

            const {references} = config;
            if (references) {
                const {model} = references;
                const singularizeName = inflect.singularize(model);
                const entityName = inflect.camelize(singularizeName);

                include.push({model: ctx.$entity[entityName], _modelName: entityName});
            }
        });

        // 多对多关系attributes体现不出来
        if (belongsToMany && Array.isArray(belongsToMany)) {
            const [through, model] = belongsToMany;
            const iObj = {};

            if (model) iObj.model = ctx.$entity[model];
            if (through) iObj.through = ctx.$entity[through];

            include.push(iObj);
        }

        return include.length ? include : undefined;
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
                    const includeModel = jsonItem[_modelName];
                    if (includeModel) {
                        const {excludeFields: efs} = model.entityConfig;
                        jsonItem[_modelName] = _.omit(includeModel, efs);
                    }
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
        const errors = [];

        for (const [field, options] of Object.entries(attributes)) {
            if (!ignoreFields.includes(field)) {
                const {unique, type, comment, rules, allowNull} = options;
                const label = comment || field;
                const value = body[field];
                const id = body.id;

                // 必填校验
                if (!value) {
                    if (allowNull === false) {
                        errors.push(`「${label}」不可为空！`);
                    }
                    // value都为空了，直接跳过其他校验
                    continue;
                }

                // 唯一性校验
                if (unique) {
                    const data = await ctx.$entityModel.findOne({where: {[field]: value}});

                    if (data && data.id !== id) errors.push(`${label}：「${value}」已被占用！`);
                }

                // 长度校验
                const length = type?.options?.length;
                if (length && value.length > length) {
                    errors.push(`「${label}」长度不能大于${length}`);
                }

                // TODO 其他校验

                console.log('rules:', rules);

                // 可以贴合ant design 的rules方式，可以做到前后端同构
            }
        }

        return errors?.length ? errors : null;
    }
};
