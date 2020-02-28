const {connect, createModel} = require('./util');
const config = require('config');
connect(config.get('db'));

module.exports = {
    User: createModel(require('./User'), 'user'),
};
