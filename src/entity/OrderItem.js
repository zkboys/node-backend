import {UUID, INTEGER, UUIDV4} from 'sequelize';

export default {
    attributes: {
        id: {
            type: UUID,
            allowNull: false,
            primaryKey: true,
            unique: 'compositeIndex',
            defaultValue: UUIDV4,
        },
        quantity: INTEGER,
        orderId: {
            type: UUID,
            allowNull: false,
            comment: '订单',
        },
        productId: {
            type: UUID,
            allowNull: false,
            comment: '商品',
        },
    },
};
