import {Model, INTEGER, STRING} from 'sequelize';
import {Attributes, Options} from './util';

@Attributes({
    id: {
        type: INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    key: {
        type: STRING,
        field: 'r_key',
    },
    value: {
        type: STRING,
        field: 'r_value',
    },
})
@Options({
    tableName: 'redis_storage',
})
export default class RedisStorage extends Model {
}
