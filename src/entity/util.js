import Sequelize from 'sequelize';
import config from 'config';

const dbUrl = config.get('db');
const logSql = config.get('logSql');

const Op = Sequelize.Op;
const operatorsAliases = {
    $eq: Op.eq,
    $ne: Op.ne,
    $gte: Op.gte,
    $gt: Op.gt,
    $lte: Op.lte,
    $lt: Op.lt,
    $not: Op.not,
    $in: Op.in,
    $notIn: Op.notIn,
    $is: Op.is,
    $like: Op.like,
    $notLike: Op.notLike,
    $iLike: Op.iLike,
    $notILike: Op.notILike,
    $regexp: Op.regexp,
    $notRegexp: Op.notRegexp,
    $iRegexp: Op.iRegexp,
    $notIRegexp: Op.notIRegexp,
    $between: Op.between,
    $notBetween: Op.notBetween,
    $overlap: Op.overlap,
    $contains: Op.contains,
    $contained: Op.contained,
    $adjacent: Op.adjacent,
    $strictLeft: Op.strictLeft,
    $strictRight: Op.strictRight,
    $noExtendRight: Op.noExtendRight,
    $noExtendLeft: Op.noExtendLeft,
    $and: Op.and,
    $or: Op.or,
    $any: Op.any,
    $all: Op.all,
    $values: Op.values,
    $col: Op.col,
};

export function connect(url) {
    // 创建实例，进行数据库连接
    const sequelize = new Sequelize(url, {logging: logSql, operatorsAliases});

    // 测试连接是否成功
    sequelize
        .authenticate()
        .then(() => console.log('Database Connection has been established successfully.'))
        .catch(err => console.error('Unable to connect to the database:', err));
    return sequelize;
}

export const sequelize = connect(dbUrl);
