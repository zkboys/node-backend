import {STRING, UUID} from 'sequelize';

export default {
    attributes: {
        id: {
            type: UUID,
            allowNull: false,
            primaryKey: true,
        },
        key: {
            type: STRING,
            field: 'r_key',
        },
        value: {
            type: STRING,
            field: 'r_value',
        },
    },
};
