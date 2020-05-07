import {INTEGER, STRING, UUID, UUIDV4} from 'sequelize';

export default {
    attributes: {
        id: {
            type: UUID,
            allowNull: false,
            primaryKey: true,
            unique: true,
            defaultValue: UUIDV4,
        },
        key: {
            type: UUID,
            allowNull: false,
            defaultValue: UUIDV4,
            unique: true,
        },
        parentKey: {
            type: UUID,
        },
        type: {
            type: INTEGER,
            comment: '类型 功能 菜单',
        },
        text: {
            type: STRING(50),
            comment: '菜单名称',
            unique: true,
        },
        icon: {
            type: STRING(20),
            comment: '菜单图标',
        },
        path: {
            type: STRING(200),
            comment: '路由地址',
        },
        order: {
            type: INTEGER,
            comment: '排序',
        },
        url: {
            type: STRING(200),
            comment: '第三方地址',
        },
        target: {
            type: STRING(20),
            comment: '第三方网站打开方式',
        },
    },
    belongsToMany:['RoleMenu', 'Role'],
};
