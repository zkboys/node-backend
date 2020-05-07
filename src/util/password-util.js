const bcrypt = require('bcryptjs');

module.exports = {
    encode: (str) => {
        return bcrypt.hashSync(str, 8);
    },
    compare: (str, hash) => {
        return bcrypt.compareSync(str, hash);
    },
};
