import {STRING, TEXT, UUID} from 'sequelize';

export default {
    attributes: {
        id: {
            type: UUID,
            allowNull: false,
            primaryKey: true,
            unique: 'compositeIndex',
        },
        account: {
            type: STRING,
            allowNull: false,
            length: 50,
            comment: '账号',
        },
        roleId: {
            type: UUID,
            allowNull: false,
        },
        password: {
            type: STRING,
            allowNull: false,
            length: 100,
            comment: '密码',
        },
        remark: {
            type: TEXT,
            defaultValue: null,
        },
    },
};
