const {router: decorator} = require('./decorator-routes');
const page = require('./page-routes');
const api = require('./api-routes');

module.exports = {
    api,
    page,
    decorator,
};
