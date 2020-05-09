// 快速push 到git服务器脚本
const {execSync} = require('child_process');
const program = require('commander');
program
    .version(require('./package').version)
    .usage('[options] <file ...>')
    .option('-m, --message <注释>  ', '提交注释')
    .parse(process.argv);

if (!program.message) {
    console.error('ERROR:请输入注释！！！');
    return;
}

let result = execSync('git add .');
console.log(result.toString());

result = execSync(`git commit -m '${program.message}'`);
console.log(result.toString());

console.log('🔥 push...');
result = execSync('git push origin master');
console.log(result.toString());


//
// console.log('🔥 push...');
// exec(`git add . && git commit -m '${program.message}' && git push origin master `, function (error, stdout, stderr) {
//     if (error) console.error(error);
//
//     stdout && console.log(stdout);
//     stderr && console.log(stderr);
// });
