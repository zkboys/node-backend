import path from 'path';
import loadFile from '../util/loadFile';
import {createModel} from './util';
import config from 'config';

const isDev = config.get('isDev');

const root = __dirname;
const dir = path.resolve(__dirname, '**/*.js');

// 相对root的文件路径
const ignoreFiles = ['./index.js', './fields_table.js', './util.js'];

// 自动加载entity下的文件
const entities = loadFile({
    dir,
    root,
    ignoreFiles,
    operator: ({fileName, content}) => {
        const model = createModel(fileName, content);

        // 同步数据库，一般用于开发环境比较好 添加force: true 会删除数据库之后，重新创建，会丢失数据
        if (isDev) model.sync();
        // if (isDev) model.sync({force: true});

        return model;
    },
});

module.exports = entities;
