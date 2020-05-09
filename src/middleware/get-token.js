const config = require('config');
const util = require('../util');

module.exports = (app, options) => async (ctx, next) => {
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
};
