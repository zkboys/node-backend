import {CronJob} from 'cron';
import config from 'config';

// 定时任务
export const cron = new CronJob(config.get('cronJobExpression'), () => {
    console.log('Executing cron job once every hour');
});
