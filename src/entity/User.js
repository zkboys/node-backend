import {Model, INTEGER, STRING} from 'sequelize';
import {Attributes, Options} from './util';

@Attributes({
    id: {
        type: INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: STRING,
    },
    password: {
        type: STRING,
    },
})
@Options({
    tableName: 'user',
})
export default class User extends Model {
    // 这里可以封装方法
    static findByName(name) {
        return super.findOne({where: {name}});
    }
}
