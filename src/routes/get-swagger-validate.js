const packageJson = require('../../package.json');
const {
    swagger,
    apiBasePath = '',
    swaggerVersion,
    externalDocs,
    schemes,
} = require('config');

const result = {
    swaggerJson: { // swagger json 数据
        swagger: swaggerVersion,
        info: { // 项目基本信息，从 package.json中获取
            version: packageJson.version,
            title: `${packageJson.name}接口文档`,
            description: packageJson.description,
        },
        externalDocs,
        basePath: apiBasePath,
        schemes,
        tags: [],
        paths: {},
    },
    descriptor: {}, // async-validate 所需数据
};

/**
 * 添加配置，每次调用次函数，都会在result对象中添加数据
 * @param options
 */
function addOptions(options) {
    // 系统配置显示swagger文档
    if (swagger) {
        swaggerBaseTags(options);
        swaggerPaths(options);
    }
}

/**
 * 获取swagger基本tags
 * @param options
 */
function swaggerBaseTags(options) {
    const {classOptions: {tags}} = options;
    const {swaggerJson} = result;

    if (tags) {
        tags.forEach(tag => {
            if (!swaggerJson.tags.find(item => item.name === tag.name)) {
                swaggerJson.tags.push(tag);
            }
        });
    }
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
        consumes = [
            'application/json',
        ],
        produces = [
            'application/json',
        ],
        responses = {},

        header,
        path,
        query,
        body,
        formData,

        classOptions,

    } = options;

    if (!apiPath || !apiMethod) return;

    const {swaggerJson: {paths}} = result;
    if (!paths[apiPath]) paths[apiPath] = {};

    if (!paths[apiPath][apiMethod]) paths[apiPath][apiMethod] = {};

    const pathMethodJson = paths[apiPath][apiMethod];

    // 具体方法没有配置tags，获取class级别tags，或者类名
    if (!tags) {
        if (classOptions.tags) {
            tags = classOptions.tags.map(item => item.name);
        } else {
            tags = ['类名'];
        }
    }
    // tags 肯能为单个字符串
    if (!Array.isArray(tags)) tags = [tags];

    // 返回结果
    const res = {
        200: {
            description: '成功',
        },
        400: {
            description: '发生错误',
            schema: {
                $ref: '#/definitions/Error',
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

        if (key === 'body') {
            const required = Object.entries(value)
                .filter(([, opt]) => opt.required)
                .map(([field]) => field);
            const schema = {
                type: 'object', // fixme 其他类型呢？ $ref 呢？
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

    pathMethodJson.tags = tags;
    pathMethodJson.summary = summary;
    pathMethodJson.description = description;
    pathMethodJson.consumes = consumes;
    pathMethodJson.produces = produces;
    pathMethodJson.responses = res;
    pathMethodJson.parameters = parameters;
}

module.exports = {
    addOptions,
    swaggerJson: result.swaggerJson,
    descriptor: result.descriptor,
};
