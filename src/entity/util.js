const Sequelize = require('sequelize');

let sequelize;

module.exports = {
    connect: url => {
        sequelize = new Sequelize(url);

        sequelize
            .authenticate()
            .then(() => console.log('Connection has been established successfully.'))
            .catch(err => console.error('Unable to connect to the database:', err));
        return sequelize;
    },
    createModel: (attributes, options) => {
        class Temp extends Sequelize.Model {
        }

        if (typeof options === 'string') options = {tableName: options};

        let {modelName, tableName} = options;

        if (!modelName) modelName = tableName;

        Temp.init(attributes, {sequelize, ...options, modelName});

        return Temp;
    },
};
