const path = require('path');
const port = +process.env.PORT || 4300;
const secret = process.env.JWT_SECRET || 'shared-secret';
const https = process.env.HTTPS === 'true';
const isDev = process.env.NODE_ENV === 'development';
module.exports = {
    isDev,
    https,
    port,
    host: 'localhost',
    pageSize: 30,
    proxy: false,
    logSql: false,
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
        // 最小单位 秒
        expire: 60 * 60 * 24 * 7, // 七天
        // expire: 3, // 秒
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
    ldap: {
        server: '',
        bindDN: '',
        password: '',
        filter: {
            base: '',
            attributeName: '',
        },
    },
    fe: {
        copyright: '',
        storageNamespace: 'easy-mock_',
        timeout: 25000,
        publicPath: '/dist/',
    },
};
