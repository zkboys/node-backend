import path from 'path';
import {Model} from 'sequelize';
import loadFile from '../util/loadFile';
import {sequelize} from './util';
import config from 'config';

const isDev = config.get('isDev');

const root = __dirname;
const dir = path.resolve(__dirname, '**/*.js');

// 相对root的文件路径
const ignoreFiles = ['./index.js', './util.js'];

// 自动加载entity下的文件
const entities = loadFile({
    dir,
    root,
    ignoreFiles,
    operator: ({fileName, content}) => {
        let {attributes, options, forceSync} = content;
        if (!options) options = {};

        if (!options.modelName) options.modelName = fileName;

        if (!options.underscored) options.underscored = true;

        class TemplateModel extends Model {
            static entityConfig = content;
        }

        TemplateModel.init(attributes, {sequelize, ...options});

        // 开发模式下，通过forceSync字段，可以强制同步创建数据库
        if (forceSync && isDev) {
            TemplateModel.sync({force: true});
        }


        return TemplateModel;
    },
});

// 添加关系
Object.entries(entities).forEach(([entityName, entity]) => {
    const {entityConfig} = entity;

    const {hasOne, hasMany, belongsTo, belongsToMany} = entityConfig;

    if (hasOne) entity.hasOne(entities[hasOne]);
    if (hasMany) entity.hasMany(entities[hasMany]);
    if (belongsTo) entity.belongsTo(entities[belongsTo]);

    if (belongsToMany) {
        // 多对多关系
        if (Array.isArray(belongsToMany)) {
            const [through, target] = belongsToMany;
            entity.belongsToMany(entities[target], {
                through: entities[through],
            });
        } else {
            entity.belongsToMany(entities[belongsToMany]);
        }
    }
});

// 只在开发模式下同步数据库 添加force: true 会删除数据库之后，重新创建，会丢失数据
isDev && sequelize.sync().then(async () => {
    // 初始化数据
    console.log('数据库同步完成');

    const {User, Role} = entities;

    let role = await Role.findOne();
    if (!role) {
        role = await Role.create({
            name: '管理员',
            description: '管理员拥有所有权限',
        });
    }

    const users = await User.findAll();
    if (!users.length) {
        // admin / 111
        // User.create({
        //     account: 'admin',
        //     password: '$2a$08$RE0ux8KuSSlrfz8QaxQj4OwKIxoZD.9.WBOMYFjP6spz4sZD7uTDO',
        //     roleId: role.id,
        // });
        await role.createUser({
            account: 'admin',
            password: '$2a$08$RE0ux8KuSSlrfz8QaxQj4OwKIxoZD.9.WBOMYFjP6spz4sZD7uTDO',
        });
    }
});

module.exports = entities;
