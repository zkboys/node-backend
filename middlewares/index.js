'use strict';

const config = require('config');
const ipFilter = require('ip-filter');
const {pathToRegexp} = require('path-to-regexp');

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
    if (data) this.body = data;
    return this.body;
}

function fail(message, code = -1, data = null) {
    this.response.status = 400;
    this.body = {
        code,
        message: message || codeMap[code],
        data,
    };
    return this.body;
}

module.exports = class Middleware {
    static util(ctx, next) {
        ctx.set('X-Request-Id', ctx.req.id);
        ctx.success = success.bind(ctx);
        ctx.fail = fail.bind(ctx);
        return next();
    }

    static ipFilter(ctx, next) {
        if (ipFilter(ctx.ip, blackIPs, {strict: false})) {
            ctx.fail('请求频率太快，已被限制访问');
            return;
        }
        return next();
    }

    static mockFilter(ctx, next) {
        const pathNode = pathToRegexp('/mock/:projectId(.{24})/:mockURL*').exec(ctx.path);

        if (!pathNode) ctx.throw(404);
        if (blackProjects.indexOf(pathNode[1]) !== -1) {
            ctx.fail('接口请求频率太快，已被限制访问');
            return;
        }

        ctx.pathNode = {
            projectId: pathNode[1],
            mockURL: '/' + (pathNode[2] || ''),
        };

        return next();
    }
};
