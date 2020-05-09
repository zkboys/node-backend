// 快速push 到git服务器脚本
const exec = require('child_process').exec;
const program = require('commander');
program
    .version(require('./package').version)
    .usage('[options] <file ...>')
    .option('-m, --message <说明>  ', '提交说明')
    .parse(process.argv);

if (!program.message) {
    console.error('ERROR:请输入注释！！！');
    return;
}

exec(`git add . && git commit -m '${program.message}' && git push origin master `, function (error, stdout, stderr) {
    if (error) console.error(error);

    stdout && console.log(stdout);
    stderr && console.log(stderr);
});
