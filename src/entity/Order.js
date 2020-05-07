import {UUID, UUIDV4} from 'sequelize';

export default {
    attributes: {
        id: {
            type: UUID,
            allowNull: false,
            primaryKey: true,
            unique: 'compositeIndex',
            defaultValue: UUIDV4,
        },
        userId: {
            type: UUID,
            allowNull: false,
            comment: '用户',
        },
    },
};
