import Sequelize from 'sequelize';
import config from 'config';

const dbUrl = config.get('db');
const logSql = config.get('logSql');
let _sequelize;

export function connect(url) {
    // 如果实例存在，直接返回
    if (_sequelize) return _sequelize;

    // 创建实例，进行数据库连接
    _sequelize = new Sequelize(url, {logging: logSql});

    // 测试连接是否成功
    _sequelize
        .authenticate()
        .then(() => console.log('Database Connection has been established successfully.'))
        .catch(err => console.error('Unable to connect to the database:', err));
    return _sequelize;
}

// 属性配置装饰器
export function Attributes(attributes) {
    return (target) => {
        target.__attributes = attributes;

        const {__options} = target;
        if (!__options) return target;

        if (!_sequelize) _sequelize = connect(dbUrl);

        target.init(attributes, {sequelize: _sequelize, ...__options});
        return target;
    };
}

// 参数配置装饰器
export function Options(options) {
    return (target) => {
        target.__options = options;

        const {__attributes} = target;
        if (!__attributes) return target;
        if (!_sequelize) _sequelize = connect(dbUrl);

        target.init(__attributes, {sequelize: _sequelize, ...options});

        return target;
    };
}

export const sequelize = connect(dbUrl);
