import {STRING, TEXT, UUID, INTEGER, UUIDV4} from 'sequelize';
import passwordUtil from '../util/password-util';

export default {
    attributes: {
        id: {
            type: UUID,
            allowNull: false,
            primaryKey: true,
            unique: true,
            defaultValue: UUIDV4,
        },
        account: {
            type: STRING,
            allowNull: false,
            length: 50,
            comment: '账号',
        },
        position: {
            type: INTEGER,
            comment: '职位',
        },
        roleId: {
            type: UUID,
        },
        password: {
            type: STRING,
            allowNull: false,
            length: 100,
            comment: '密码',
            set(val) {
                this.setDataValue('password', passwordUtil.encode(val));
            },
        },
        remark: {
            type: TEXT,
            defaultValue: null,
        },
    },
    // 关系
    belongsTo: 'Role',
    // 忽略，不返给前端的字段
    excludeFields: ['password'],

    // 添加 修改时，不参与后端校验字段
    excludeValidateFields: ['password'],
};
