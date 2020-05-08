import path from 'path';
import loadFile from '../util/loadFile';

const root = __dirname;
const dir = path.resolve(__dirname, '**/*.js');

// 相对root的文件路径
const ignoreFiles = []; // ['./index.js'];

// 自动加载controllers中的文件
module.exports = loadFile({
    dir,
    root,
    ignoreFiles,
    ignoreLower: true, // 忽略首字母小写的文件
});
