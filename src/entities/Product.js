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
            comment: '产品名称',
        },
        description: {
            type: STRING(200),
            // allowNull: false,
            comment: '描述',
        },
    },
};
