import Sequelize from 'sequelize';
import config from 'config';

const dbUrl = config.get('db');
let sequelize;

export function connect(url) {
    if (sequelize) return sequelize;
    sequelize = new Sequelize(url);

    sequelize
        .authenticate()
        .then(() => console.log('Connection has been established successfully.'))
        .catch(err => console.error('Unable to connect to the database:', err));
    return sequelize;
}

export function Attributes(attributes) {
    return (target) => {
        target.__attributes = attributes;

        const {__options} = target;
        if (!__options) return target;

        if (!sequelize) sequelize = connect(dbUrl);

        target.init(attributes, {sequelize, ...__options});
        return target;
    };
}

export function Options(options) {
    return (target) => {
        target.__options = options;

        const {__attributes} = target;
        if (!__attributes) return target;
        if (!sequelize) sequelize = connect(config.get('db'));

        target.init(__attributes, {sequelize, ...options});

        return target;
    };
}
