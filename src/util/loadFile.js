const glob = require('glob');
const path = require('path');

module.exports = function (options) {
    const {root, dir, ignoreFiles, operator} = options;
    const files = glob.sync(dir);
    const result = {};

    if (files?.length) {
        files.forEach(file => {
            const shortPath = file.replace(root, '.');
            if (!ignoreFiles.includes(shortPath)) {
                const fileNames = shortPath.replace('./', '').split('/');
                let con = require(file);
                con = con.default ? con.default : con;

                if (operator) {
                    const fileName = path.basename(shortPath).replace(path.extname(shortPath), '');
                    con = operator({fileName, content: con});
                }

                const fns = fileNames.map(name => path.basename(name).replace(path.extname(name), ''));

                if (fns.length === 1) {
                    result[fns[0]] = con;
                } else {
                    // 多目录结构支持，good->a->User.js  => result.good.a.user
                    fns.forEach((name, index) => {
                        const parentName = fns[index - 1];
                        if (parentName) {
                            if (!result[parentName]) result[parentName] = {};

                            const parent = result[parentName];

                            if (!parent[name]) parent[name] = {};

                            if (index === fns.length - 1) {
                                parent[name] = con;
                            }
                        }
                    });
                }
            }
        });
    }

    return result;
};
