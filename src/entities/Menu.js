import {INTEGER, STRING, UUID, UUIDV4} from 'sequelize';

export default {
    name: '系统菜单',
    attributes: {
        id: {
            type: UUID,
            allowNull: false,
            primaryKey: true,
            unique: true,
            defaultValue: UUIDV4,
        },
        parentId: {
            type: UUID,
        },
        type: {
            type: STRING(10),
            comment: '类型  1:菜单 2:功能',
        },
        text: {
            type: STRING(50),
            comment: '菜单名称',
            unique: true,
        },
        code: {
            type: STRING(50),
            comment: '功能编码',
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
    belongsToMany: {
        model: 'Role',
        through: 'RoleMenu',
    },
};
