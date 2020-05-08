import {STRING, UUID, UUIDV4} from 'sequelize';

export default {
    attributes: {
        id: {
            type: UUID,
            allowNull: false,
            primaryKey: true,
            unique: true,
            defaultValue: UUIDV4,
        },
        name: {
            type: STRING(50),
            allowNull: false,
            unique: true,
            comment: '角色名',
            abc: '我是abc', // 可以自定义字段
            rules: [],
        },
        description: {
            type: STRING(200),
            // allowNull: false,
            comment: '描述',
        },
    },
    hasMany: 'User',
    belongsToMany: {model: 'Menu', through: 'RoleMenu'},
};
