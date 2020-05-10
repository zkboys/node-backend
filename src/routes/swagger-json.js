const {
    swagger,
    apiBasePath = '',
    swaggerVersion,
    externalDocs,
    schemes,
} = require('config');
const {
    version,
    name: title,
    description,
} = require('../../package.json');

const commonApi = require('./common-api-swagger-json');

const swaggerJson = { // swagger json 数据
    swagger: swaggerVersion,
    info: { // 项目基本信息，从 package.json中获取
        version,
        title: `${title} - 接口文档`,
        description,
    },
    externalDocs,
    basePath: apiBasePath,
    schemes,
    tags: [],
    paths: {},
};

// 通用restful接口文档
commonApi().forEach(item => addOptions(item));

/**
 * 添加配置，每次调用次函数，都会在swaggerJson对象中添加数据
 * @param options
 */
function addOptions(options) {
    // 如果配置中，是启用swagger，不拼接swagger.json
    if (!swagger) return;

    swaggerBaseTags(options);
    swaggerPaths(options);
}

/**
 * 获取swagger基本tags
 * @param options
 */
function swaggerBaseTags(options) {
    let {classOptions: {tags, className}} = options;

    if (!tags) tags = [{name: className}];

    tags.forEach(tag => {
        if (!swaggerJson.tags.find(item => item.name === tag.name)) {
            swaggerJson.tags.push(tag);
        }
    });
}

/**
 * 获取swagger paths配置
 * @param options
 */
function swaggerPaths(options) {
    let {
        apiPath,
        apiMethod,
        tags,
        summary,
        description,
        operationId,
        consumes,
        produces = [
            'application/json',
        ],
        responses = {},
        object200,
        array200,

        header,
        path,
        query,
        body,
        formData,

        classOptions,

    } = options;

    if (!apiPath || !apiMethod) return;

    if (apiMethod === 'del') apiMethod = 'delete';

    // :id => {id}
    if (apiPath.includes('/:')) {
        const paths = apiPath.split('/');

        paths.forEach((item, index, arr) => {
            if (item.startsWith(':')) {
                arr[index] = `{${item.replace(':', '')}}`;
            }
        });
        apiPath = paths.join('/');
    }

    // 处理默认请求类型
    if (formData && !consumes) consumes = ['application/x-www-form-urlencoded'];
    if (!consumes) consumes = ['application/json'];

    const {paths} = swaggerJson;
    if (!paths[apiPath]) paths[apiPath] = {};

    const classTags = classOptions.tags ? classOptions.tags.map(item => item.name) : null;

    // 具体方法没有配置tags，获取class级别tags，或者类名
    if (!tags) {
        if (classTags) {
            tags = classTags;
        } else {
            tags = [classOptions.className];
        }
    } else {
        // tags 可能为单个字符串
        if (!Array.isArray(tags)) tags = [tags];

        // 将class级别tags合并
        if (classTags) {
            tags = [...classTags, ...tags];
        }
    }

    // 返回结果
    if (object200 && !responses[200]) {
        setPropertiesDefaultValue(object200, true);

        responses[200] = {
            description: '成功',
            schema: {
                type: 'object',
                properties: object200,
            },
        };
    }
    if (array200 && !responses[200]) {
        setPropertiesDefaultValue(array200, true);

        responses[200] = {
            description: '成功',
            schema: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: array200,
                },
            },
        };
    }
    const res = {
        200: {
            description: '成功',
        },
        400: {
            description: '失败：业务逻辑错误，校验错误等',
            schema: {
                type: 'object',
                properties: {
                    code: {
                        type: 'string',
                        description: '错误码',
                    },
                    message: {
                        type: 'string',
                        description: '单条错误信息',
                    },
                    messages: {
                        type: 'array',
                        description: '所有的错误信息',
                        items: {
                            type: 'string',
                        },
                    },
                },
            },
        },
        ...responses,
    };

    // 请求参数配置
    const parameters = [];

    Object.entries({
        header,
        path,
        query,
        body,
        formData,
    }).forEach(([key, value]) => {
        if (!value) return;

        setPropertiesDefaultValue(value);

        if (key === 'body') {
            const required = Object.entries(value)
                .filter(([, opt]) => opt.required)
                .map(([field]) => field);
            const schema = {
                type: 'object', // fixme 其他类型呢？
                required,
                properties: value,
            };
            parameters.push({
                in: key,
                name: key,
                description: `${key} 数据描述`,
                required: true,
                schema,
            });
        } else {
            Object.entries(value).forEach(([field, opt]) => {
                parameters.push({
                    ...opt,
                    name: field,
                    in: key,
                });
            });
        }
    });

    paths[apiPath][apiMethod] = {
        tags,
        summary,
        description,
        consumes,
        produces,
        responses: res,
        parameters,
        operationId,

        // "security": [
        //     {
        //         "petstore_auth": [
        //             "write:pets",
        //             "read:pets"
        //         ]
        //     }
        // ]
    };
}

function setPropertiesDefaultValue(properties, descriptionToExample) {
    if (!properties) return;
    if (typeof properties !== 'object') return;

    Object.entries(properties).forEach(([key, value]) => {
        if (typeof value === 'string') {
            properties[key] = value = {
                type: 'string',
                description: value,
            };
        }
        if (!('type' in value)) value.type = 'string';

        if (!('example' in value)) value.example = value.description;

        if (value.properties) setPropertiesDefaultValue(value.properties);
    });
}

module.exports = {
    addOptions,
    swaggerJson: swaggerJson,
};
