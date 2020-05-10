const Router = require('koa-router');
const router = new Router({prefix: '/api'});
const {addOptions} = require('./swagger-json');
const validateApi = require('../middleware/validate-api');

// 装饰器，只用于生成路由，swagger文档，参数校验，不要参与其他业务逻辑

function Api(options) {
    return function (target) {
        if (typeof options === 'string') options = {tags: [options]};

        if (options.tags && !Array.isArray(options.tags)) options.tags = [options.tags];

        options.tags && options.tags.forEach((item, index, arr) => {
            if (typeof item === 'string') arr[index] = {name: item};
        });

        // 类级别中间件
        target.__options = options;

        return target;
    };
}

function method(methodName = 'get') {
    return function (path, options = {}) {
        return function (target, property, descriptor) {
            // 方法装饰器会优先于类装饰器执行，添加nextTick，可以回去到类装饰器处理之后的结果
            // 类装饰器 通过 target 可以传递一些数据到 方法装饰器中
            process.nextTick(() => {
                // 当前类如果没有调用@Api 将不会有classOptions
                const classOptions = target.__options || {};
                classOptions.className = target.name;

                const prefixedPath = classOptions.prefix ? `${classOptions.prefix}${path}` : `${path}`;

                // 收集所有的配置，生成swagger.json
                const allOptions = {
                    ...options,
                    apiPath: prefixedPath,
                    apiMethod: methodName,
                    operationId: property,
                    classOptions,
                };
                addOptions(allOptions);

                const middleware = [validateApi(allOptions)];
                // 处理类级别中间件
                if (classOptions.middleware) middleware.push(...classOptions.middleware);
                // 处理方法级别中间件
                if (options.middleware) middleware.push(...options.middleware);
                // 添加路由
                middleware.push(descriptor.value);

                // 需要进行bind ，否则会导致方法内部的this丢失
                descriptor.value = descriptor.value.bind(target);

                router[methodName](prefixedPath, ...middleware);
            });
        };
    };
}

module.exports = {
    router,
    Get: method('get'),
    Post: method('post'),
    Put: method('put'),
    Del: method('del'),
    Patch: method('patch'),
    Api,
};
