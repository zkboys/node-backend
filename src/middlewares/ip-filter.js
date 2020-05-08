const config = require('config');
const ipFilter = require('ip-filter');
const blackIPs = config.get('blackList.ips');

module.exports = function (options, app) {
    return async function (ctx, next) {
        if (ipFilter(ctx.ip, blackIPs, {strict: false})) {
            return ctx.fail('请求频率太快，已被限制访问');
        }
        return next();
    };
};
