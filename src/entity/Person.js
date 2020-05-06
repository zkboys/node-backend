import {STRING, UUID} from 'sequelize';

export default {
    attributes: {
        id: {
            type: UUID,
            allowNull: false,
            primaryKey: true,
            unique: 'compositeIndex',
        },
        name: {
            type: STRING,
            allowNull: false,
            length: 50,
        },
    },
};
