import path from 'path';
import {Model} from 'sequelize';
import inflection from 'inflection';
import loadFile from '../util/loadFile';
import dbTypeToSwagger from '../util/dbtype-to-swagger.js';
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
        let {name, attributes, options, forceSync, excludeFields = []} = content;

        // 转化为swagger配置
        content.toSwagger = function () {
            const result = {};
            Object.entries(attributes).forEach(([field, opt]) => {
                if (excludeFields.includes(field)) return;

                const {comment} = opt;
                const type = dbTypeToSwagger(opt.type);
                let description = field;

                if (comment) description = comment.split(' ')[0];

                result[field] = {
                    type,
                    description,
                };
            });

            return result;
        };

        if (!('commonApi' in content)) content.commonApi = true;

        if (!('queryFields' in content)) content.queryFields = true;

        // 统一转化
        // 单个字符串情况
        if (typeof content.queryFields === 'string') content.queryFields = [content.queryFields];

        // 字符串配置，转对象配置
        if (Array.isArray(content.queryFields)) {
            content.queryFields.forEach((item, index, arr) => {
                if (typeof item === 'string') {
                    arr[index] = {
                        field: item,
                        like: true, // 模糊查询，默认为true
                    };
                }
            });
        }
        // 所有字段默认都是查询条件
        if (content.queryFields === true) {
            content.queryFields = Object.entries(attributes).map(([field]) => {
                let like = true;

                // 以id结尾的字段，不进行模糊查询
                if (field.toLocaleLowerCase().endsWith('id')) like = false;

                return {
                    field,
                    like,
                };
            });
        }

        if (!options) options = {};

        if (!options.comment) options.comment = name;

        if (!options.modelName) options.modelName = fileName;

        if (!options.underscored) options.underscored = true;

        class TemplateModel extends Model {
            static entityConfig = content;
        }

        TemplateModel.init(attributes, {sequelize, ...options});

        // 开发模式下，通过forceSync字段，可以强制同步创建数据库
        if (forceSync && isDev) {
            console.log(`强制同步数据库 ${fileName} -> ${inflection.pluralize(inflection.underscore(fileName))}`);
            TemplateModel.sync({force: true});
        }

        return TemplateModel;
    },
});

// 添加关系
Object.entries(entities).forEach(([, entity]) => {
    const {entityConfig} = entity;

    const {hasOne, hasMany, belongsTo, belongsToMany} = entityConfig;

    Object.entries({
        hasOne,
        hasMany,
        belongsTo,
        belongsToMany,
    })
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

    await initDatabase(entities);
});

module.exports = entities;
