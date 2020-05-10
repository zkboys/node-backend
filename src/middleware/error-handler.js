const config = require('config');

const isDev = config.get('isDev');

module.exports = (app, options) => async function (ctx, next) {
    try {
        await next();
    } catch (err) {
        console.error(err);

        app.emit('err', err, this);

        if (err.isCtxFail) {
            Reflect.deleteProperty(err, 'isCtxFail');

            ctx.status = err.status;
            ctx.body = err;
            return;
        }

        const status = err.status || 500;

        // 开发模式返回详细的错误信息，便于调试
        const message = isDev ? err.message : 'Internal Server Error';

        ctx.body = {
            code: status,
            message,
            messages: err.messages,
        };
        ctx.status = status;
    }
};
