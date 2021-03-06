const path = require('path');
const port = +process.env.PORT || 4300;
const secret = process.env.JWT_SECRET || '095fd892-958d-4310-9e0f-eb1488dc8bb6';
const https = process.env.HTTPS === 'true';
const isDev = process.env.NODE_ENV === 'development';
module.exports = {
    isDev,
    https,
    port,
    host: 'localhost',
    pageSize: 30,
    proxy: false,
    logSql: true,

    swaggerVersion: '2.0',
    apiBasePath: '/api',
    externalDocs: {},
    schemes: ['http'],

    unsplashClientId: '',
    cronJobExpression: '0 * * * *',
    blackList: {
        projects: [],
        ips: [],
    },
    rateLimit: {
        max: 1000,
        duration: 1000,
    },
    jwt: {
        cookieName: 'SESSION_ID',
        tokenName: 'token',
        // 过期时间 最小单位 秒
        expire: 60 * 60 * 24 * 7, // 七天
        secret,
    },
    upload: {
        types: [
            '.jpg',
            '.jpeg',
            '.png',
            '.gif',
            '.json',
            '.yml',
            '.yaml',
        ],
        size: 5242880,
        dir: path.resolve(__dirname, '../', 'src', 'public', 'upload'),
        expire: {
            types: [
                '.json',
                '.yml',
                '.yaml',
            ],
            day: -1,
        },
    },
};
