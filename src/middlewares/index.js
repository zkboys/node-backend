'use strict';

const config = require('config');
const ipFilter = require('ip-filter');
const {pathToRegexp} = require('path-to-regexp');
const util = require('../util');
const blackProjects = config.get('blackList.projects');
const blackIPs = config.get('blackList.ips');

const codeMap = {
    '-1': 'fail',
    200: 'success',
    401: 'token expired',
    500: 'server error',
    10001: 'params error',
};

function success(data) {
    this.response.status = 200;
    if (data !== undefined) this.body = data;
}

function fail(message, code = -1, data = null) {
    const messages = getMessages(message, code);

    this.response.status = 400;
    this.body = {
        code,
        message: messages[0],
        messages,
        data,
    };
}

function getMessages(msg, code) {
    if (!msg) return [codeMap[code]];

    if (Array.isArray(msg)) {
        let messages = [];

        msg.forEach(item => {
            if (typeof item === 'object') {
                messages = messages.concat(Object.values(item));
            } else if (typeof item === 'string') {
                messages.push(item);
            }
        });

        return messages;
    }

    if (typeof msg === 'string') return [msg];
}

module.exports = class Middleware {
    static util(ctx, next) {
        ctx.set('X-Request-Id', ctx.req.id);
        ctx.success = success;
        ctx.fail = fail;
        return next();
    }

    static ipFilter(ctx, next) {
        if (ipFilter(ctx.ip, blackIPs, {strict: false})) {
            return ctx.fail('请求频率太快，已被限制访问');
        }
        return next();
    }

    static async getToken(ctx, next) {
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

        const redis = util.getRedis();
        const existToken = await redis.get(token);
        ctx.state.validateToken = existToken || 'no token';
        return next();
    }

    static mockFilter(ctx, next) {
        const pathNode = pathToRegexp('/mock/:projectId(.{24})/:mockURL*').exec(ctx.path);

        if (!pathNode) ctx.throw(404);
        if (blackProjects.indexOf(pathNode[1]) !== -1) {
            return ctx.fail('接口请求频率太快，已被限制访问');
        }

        ctx.pathNode = {
            projectId: pathNode[1],
            mockURL: '/' + (pathNode[2] || ''),
        };

        return next();
    }
};
