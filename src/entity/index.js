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

    const {User, Role, Menu} = entities;

    let role = await Role.findOne();
    if (!role) {
        role = await Role.create({
            name: '管理员',
            description: '管理员拥有所有权限',
        });
    }

    const users = await User.findAll();
    if (!users.length) {
        await role.createUser({
            account: 'admin',
            password: '111',
            email: '888@88.com',
        });
    }

    const menus = await Menu.findAll();
    if (!menus.length) {
        [
            {text: 'Ant Design 官网', icon: 'ant-design', url: 'https://ant-design.gitee.io', target: '', order: 2000},
            {text: '文档', icon: 'book', url: 'https://open.vbill.cn/react-admin', target: '_blank', order: 1200},
            {text: '自定义头部', icon: 'api', path: '/example/customer-header', order: 998},
            {text: '用户管理', icon: 'user', path: '/users', order: 900},
            {text: '角色管理', icon: 'lock', path: '/roles', order: 900},
            {text: '菜单管理', icon: 'align-left', path: '/menu-permission', order: 900},
            {text: '代码生成', icon: 'code', path: '/gen', order: 900},
            {text: '404页面不存在', icon: 'file-search', path: '/404', order: 700},
            {id: 'example', text: '示例', icon: 'align-left', order: 600},
            {parentId: 'example', text: '可编辑表格', icon: 'align-left', path: '/example/table-editable', order: 600},
        ].forEach(menu => {
            role.createMenu(menu);
        });
    }
});

module.exports = entities;
