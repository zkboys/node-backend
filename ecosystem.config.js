module.exports = {
    apps: [{
        name: 'app-dep:7301',
        script: './build/app.js',

        // args: 'one two',
        // instances: 1,
        autorestart: true,
        watch: true,
        ignore_watch: [
            'node_modules',
            'build/script/errors.json',
            'build/public',
        ],
        max_memory_restart: '1G',
        instance_var: 'INSTANCE_ID',
        env: {
            NODE_ENV: 'production',
        },
        env_test_production: {
            NODE_ENV: 'production',
            NODE_CONFIG_ENV: 'test_production',
        },
        log_date_format: 'YYYY-MM-DD HH:mm Z',
    }],
    deploy: {
        test: {
            user: 'app', // 服务器用户
            host: '172.16.175.92', // 服务器地址，多个可以是数组
            ref: 'origin/master', // git分支
            repo: 'git@github.com:zkboys/node-backend.git', // git地址
            path: '/home/app', // 项目在目标机clone下来的目录
            'post-deploy': 'yarn && pm2 startOrRestart ecosystem.config.js --env test_production', // clone完成之后执行的命令
            env: {
                NODE_ENV: 'production',
                NODE_CONFIG_ENV: 'test',
            },
        },
    },
};
