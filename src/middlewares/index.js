'use strict';

const config = require('config');
const ipFilter = require('ip-filter');
const util = require('../util');
const blackIPs = config.get('blackList.ips');
const entities = require('../entities');

module.exports = {
    requestId: (app, options) => (ctx, next) => {
        ctx.set('X-Request-Id', ctx.req.id);
        return next();
    },
    ctxSuccessFail: require('./ctx-success-fail'),
    errorHandler: require('./error-handler'),
    loadEntity: (app, options) => (ctx, next) => {
        ctx.$entity = entities;
        return next();
    },
    ipFilter: (app, options) => (ctx, next) => {
        if (ipFilter(ctx.ip, blackIPs, {strict: false})) {
            return ctx.fail('请求频率太快，已被限制访问');
        }
        return next();
    },
    getToken: (app, options) => async (ctx, next) => {
        const jwtTokenName = config.get('jwt.tokenName');
        const jwtCookieName = config.get('jwt.cookieName');

        // 三种方式获取token
        let token;
        const headerToken = ctx.request.header[String(jwtTokenName).toLowerCase()];
        const authorizationToken = (ctx.request.header.authorization || '').replace('Bearer', '').trim();
        const cookieToken = ctx.cookies.get(jwtCookieName);

        if (cookieToken) token = cookieToken;
        if (authorizationToken) token = authorizationToken;
        if (headerToken) token = headerToken;

        const redis = util.redis;
        const existToken = await redis.get(token);
        ctx.state.validateToken = existToken || 'no token';

        return next();
    },
};
