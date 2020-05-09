import Sequelize from 'sequelize';
import config from 'config';

const dbUrl = config.get('db');
const logSql = config.get('logSql');

export function connect(url) {
    // 创建实例，进行数据库连接
    const sequelize = new Sequelize(url, {
        logging: logSql ? console.log : false,
    });

    // 测试连接是否成功
    sequelize
        .authenticate()
        .then(() => console.log('Database Connection has been established successfully.'))
        .catch(err => console.error('Unable to connect to the database:', err));
    return sequelize;
}

export const sequelize = connect(dbUrl);
