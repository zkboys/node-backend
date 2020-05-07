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
            type: STRING(50),
            allowNull: false,
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
            type: STRING(100),
            allowNull: false,
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
