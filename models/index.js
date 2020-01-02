'use strict';

const mongoose = require('mongoose');
const config = require('config');

mongoose.Promise = global.Promise;
mongoose.connect(config.get('db'), {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    poolSize: 20,
}, (err) => {
    if (err) {
        console.error('connect to %s error: ', config.get('db'), err.message);
        process.exit(1);
    }
});

mongoose.set('useCreateIndex', true);

// 全局plugin 用于统一操作schema
mongoose.plugin(function (schema, options) {
    // schema.add 用来添加额外的字段
    // schema.set 用来设置属性
    // 自动处理createdAt updatedAt 两个字段 https://mongoosejs.com/docs/guide.html#timestamps
    schema.set('timestamps', {createdAt: 'createdAt', updatedAt: 'updatedAt'});
});

module.exports = {
    User: require('./user'),
    Mock: require('./mock'),
    Group: require('./group'),
    Project: require('./project'),
    MockCount: require('./mock_count'),
    UserGroup: require('./user_group'),
    UserProject: require('./user_project'),
};
