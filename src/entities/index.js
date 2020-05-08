import path from 'path';
import {Model} from 'sequelize';
import glob from 'glob';
import loadFile from '../util/loadFile';
import {sequelize} from './util';
import initDatabase from './init-database';
import config from 'config';

const isDev = config.get('isDev');

const root = __dirname;
const dir = path.resolve(__dirname, '**/*.js');

// 相对root的文件路径
const ignoreFiles = []; // ['./index.js', './util.js', './init-database.js'];

// 自动加载entity下的文件
const entities = loadFile({
    dir,
    root,
    ignoreFiles,
    ignoreLower: true, // 忽略首字母小写的文件
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

    Object.entries({hasOne, hasMany, belongsTo, belongsToMany})
        .forEach(([keyWord, value]) => {
            if (!value) return;
            if (!Array.isArray(value)) value = [value];

            value.forEach(item => {
                if (typeof item === 'string') {
                    entity[keyWord](entities[item]);
                } else {
                    const {model, through} = item;
                    entity[keyWord](entities[model], {through: entities[through]});
                }
            });
        });
});

// 只在开发模式下同步数据库 添加force: true 会删除数据库之后，重新创建，会丢失数据
isDev && sequelize.sync().then(async () => {
    // 初始化数据
    console.log('数据库同步完成');

    initDatabase(entities);
});

module.exports = entities;
