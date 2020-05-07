import {STRING, UUID, UUIDV4} from 'sequelize';

export default {
    attributes: {
        id: {
            type: UUID,
            allowNull: false,
            primaryKey: true,
            unique: 'compositeIndex',
            defaultValue: UUIDV4,
        },
        name: {
            type: STRING,
            allowNull: false,
            length: 50,
        },
    },
};
