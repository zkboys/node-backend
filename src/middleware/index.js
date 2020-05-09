'use strict';
const config = require('config');
const ipFilter = require('ip-filter');
const blackIPs = config.get('blackList.ips');
const entities = require('../entities');
const zhCn = require('./validate/i18n/zh-cn');

// 中间件是有顺序的，需要是数组
module.exports = [
    require('./ctx-success-fail'),

    (app, options) => async (ctx, next) => {
        if (ipFilter(ctx.ip, blackIPs, {strict: false})) {
            ctx.throw(400, '请求频率太快，已被限制访问');
        }

        await next();
    },

    (app, options) => async (ctx, next) => {
        ctx.set('X-Request-Id', ctx.req.id);
        await next();
    },

    // 统一处理错误
    require('./error-handler'),

    // 加载数据库实体
    (app, options) => (ctx, next) => {
        ctx.$entity = entities;
        return next();
    },

    // token 认证
    require('./get-token'),

    // 添加校验
    (app, options) => require('./validate')(app, {i18n: zhCn}),
];
