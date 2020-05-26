import {STRING, TEXT, UUID, INTEGER, UUIDV4} from 'sequelize';
import passwordUtil from '../util/password-util';

export default {
    // 作为表的注释，options.comment; swagger 可以用到
    name: '用户',
    commonApi: true, // TODO 数组 指定具体接口 getAll getOne getDetail save update deleteAll deleteOne
    // swagger 可以用到
    description: '用户模块',
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
        email: {
            type: STRING(100),
            comment: '邮箱 不可为空',
            allowNull: false,
            enum: [],
            rules: [
                {
                    type: 'email',
                    message: '请输入正确的「邮箱」！',
                },
                {
                    required: true,
                    message: '「邮箱」不可为空！',
                },
            ],
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

    // 开发模式下 强制同步数据库
    // forceSync: true,
    // 关系
    belongsTo: 'Role',
    // 忽略，不返给前端的字段
    excludeFields: ['password'],
    // 添加 修改时，不参与后端校验字段
    excludeValidateFields: ['password'],

    // 查询字段
    queryFields: [
        'account',
        {
            field: 'position',
            like: false,
        },
    ],
};
