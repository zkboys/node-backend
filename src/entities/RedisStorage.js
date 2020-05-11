import {STRING, UUID, UUIDV4} from 'sequelize';

export default {
    commonApi: false,
    attributes: {
        id: {
            type: UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: UUIDV4,
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
