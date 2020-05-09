const Router = require('koa-router');
const router = new Router({prefix: '/api'});

function method(methodName = 'get') {
    return function (path) {
        return function (target, name, descriptor) {
            const prefixPath = target.routePrefix ? `/${target.routePrefix}${path}` : `${path}`;

            // 需要进行bind ，否则会导致方法内部的this丢失
            descriptor.value = descriptor.value.bind(target);

            router[methodName](prefixPath, descriptor.value);

            return descriptor;
        };
    };
}

module.exports = {
    router,
    Get: method('get'),
    Post: method('post'),
    Put: method('put'),
    Del: method('del'),
};
