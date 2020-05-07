import {UUID, STRING, DOUBLE, UUIDV4} from 'sequelize';

export default {
    attributes: {
        id: {
            type: UUID,
            allowNull: false,
            primaryKey: true,
            unique: 'compositeIndex',
            defaultValue: UUIDV4,
        },
        title: {
            type: STRING(20),
            allowNull: false,
        },
        price: {
            type: DOUBLE,
        },
        description: {
            type: STRING(200),
        },
        userId: {
            type: UUID,
            allowNull: false,
            comment: '用户',
        },
    },
};
