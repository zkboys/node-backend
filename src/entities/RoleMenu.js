import {UUID, UUIDV4} from 'sequelize';

export default {
    name: '角色与菜单关系',
    commonApi: true,
    attributes: {
        id: {
            type: UUID,
            allowNull: false,
            primaryKey: true,
            unique: true,
            defaultValue: UUIDV4,
        },
        roleId: {
            type: UUID,
        },
        menuId: {
            type: UUID,
        },
    },
    belongsTo: ['Menu', 'Role'],
};
