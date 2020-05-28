const inflection = require('inflection');
const entities = require('../entities');
const dbTypeToSwagger = require('../util/dbtype-to-swagger');
const API_TYPE = require('../util/common-api-types');

// 通用restful接口 swagger文档
module.exports = function commonApi() {
    if (!entities) return;
    const result = [];

    Object.entries(entities).forEach(([modelName, options]) => {
        const {entityConfig} = options;
        let {
            commonApi,
            name,
            description,
        } = entityConfig;

        // 未开启通用接口，直接返回，不生成api文档
        if (!commonApi) return;

        const pluralizeName = inflection.pluralize(inflection.camelize(modelName, true));

        if (!name) name = modelName;

        name = name.split(' ')[0];

        const classOptions = {
            tags: [
                {
                    name,
                    description,
                },
            ],
            className: modelName,
        };

        // 查询条件
        const query = getQuery(entityConfig);

        const properties = getProperties(entityConfig);

        const hasApi = (type) => {
            if (commonApi === true) return true;

            if (Array.isArray(commonApi)) return commonApi.includes(type);
        };

        hasApi(API_TYPE.findAll) && result.push({
            apiPath: `/${pluralizeName}`,
            apiMethod: 'get',
            summary: `查询「${name}」`,
            description: '如果传递 pageNum、pageSize，将进行分页查询，否者查询全部。',
            operationId: 'findAll',
            responses: {
                200: {
                    description: '成功：分页查询返回 {total, list}，非分页查询直接返回数组结果。',
                    schema: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties,
                        },
                    },
                },
            },
            query: {
                pageNum: {
                    type: 'integer',
                    description: '分页 - 当前页',
                },
                pageSize: {
                    type: 'integer',
                    description: '分页 - 每页显示数量',
                },
                ...query,
            },
            classOptions,
        });

        hasApi(API_TYPE.findOne) && result.push({
            apiPath: `/one/${pluralizeName}`,
            apiMethod: 'get',
            summary: `查询单个「${name}」`,
            description: `根据条件查询「${name}」详情`,
            operationId: 'findOne',
            responses: {
                200: {
                    description: '成功',
                    schema: {
                        type: 'object',
                        properties,
                    },
                },
            },
            query,
            classOptions,
        });

        hasApi(API_TYPE.findById) && result.push({
            apiPath: `/${pluralizeName}/:id`,
            apiMethod: 'get',
            summary: `根据id查询单个「${name}」`,
            description: `根据id查询「${name}」详情`,
            operationId: 'findById',
            responses: {
                200: {
                    description: '成功',
                    schema: {
                        type: 'object',
                        properties,
                    },
                },
            },
            path: {
                id: {
                    type: 'string',
                    description: `「${name}」 id`,
                    required: true,
                },
            },
            classOptions,
        });

        hasApi(API_TYPE.save) && result.push({
            apiPath: `/${pluralizeName}`,
            apiMethod: 'post',
            summary: `添加「${name}」`,
            description: `添加「${name}」，body支持数组，批量添加`,
            operationId: 'save',
            responses: {
                200: {
                    description: '成功：批量添加时，返回数组',
                    schema: {
                        type: 'object',
                        properties,
                    },
                },
            },
            body: getProperties({
                ...entityConfig,
                excludeFields: [],
            }),
            classOptions,
        });

        hasApi(API_TYPE.update) && result.push({
            apiPath: `/${pluralizeName}`,
            apiMethod: 'put',
            summary: `更新「${name}」`,
            description: `更新「${name}」`,
            operationId: 'update',
            responses: {
                200: {
                    description: '成功',
                    schema: {
                        type: 'object',
                        properties,
                    },
                },
            },
            body: getProperties({
                ...entityConfig,
                excludeFields: [],
            }),
            classOptions,
        });

        hasApi(API_TYPE.deleteById) && result.push({
            apiPath: `/${pluralizeName}/:id`,
            apiMethod: 'del',
            summary: `根据id删除「${name}」`,
            description: `根据id删除「${name}」`,
            operationId: 'deleteById',
            responses: {
                200: {
                    description: '成功',
                },
            },
            path: {
                id: {
                    type: 'string',
                    description: `「${name}」 id`,
                    required: true,
                },
            },
            classOptions,
        });

        hasApi(API_TYPE.deleteByIds) && result.push({
            apiPath: `/${pluralizeName}`,
            apiMethod: 'del',
            summary: `批量删除「${name}」`,
            description: `根据ids批量删除「${name}」，ids以英文逗号分隔`,
            operationId: 'deleteByIds',
            responses: {
                200: {
                    description: '成功',
                },
            },
            query: {
                ids: {
                    type: 'string',
                    description: `「${name}」 ids，以英文逗号分隔`,
                    required: true,
                },
            },
            classOptions,
        });
    });

    return result;
};

function getQuery({attributes, queryFields}) {
    const query = {
        include: {
            type: 'boolean',
            description: '是否进行关联查询',
        },
    };

    if (queryFields && Array.isArray(queryFields)) {
        queryFields.forEach(item => {
            const {field, like, required} = item;
            const options = attributes[field];
            const {comment, example, items} = options;

            let type = dbTypeToSwagger(options.type);

            if (items) type = 'array';

            query[field] = {
                type,
                description: `${comment || field} - ${like ? '模糊查询' : '精确查询'}`,
                required,
                enum: options.enum,
                example,
                items,
            };
        });
    }

    return query;
}

function getProperties(entityConfig) {
    const {attributes, excludeFields = []} = entityConfig;

    const result = {};

    Object.entries(attributes).forEach(([field, opt]) => {
        // 忽略字段，不给前端返回
        if (excludeFields.includes(field)) return;

        const {type, comment, allowNull, defaultValue} = opt;
        const required = allowNull === false && !defaultValue;

        result[field] = {
            type: dbTypeToSwagger(type),
            required,
            example: comment || field,
        };
    });
    return result;
}
