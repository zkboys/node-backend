const {CronJob} = require('cron');
const config = require('config');

// 定时任务
module.exports.cron = new CronJob(config.get('cronJobExpression'), () => {
    console.log('Executing cron job once every hour');
});
