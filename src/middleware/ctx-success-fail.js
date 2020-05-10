const codeMap = {
    '-1': 'fail',
    200: 'success',
    401: 'token expired',
    500: 'server error',
    10001: 'params error',
};

function success(data) {
    this.response.status = 200;
    if (data !== undefined) this.body = data;
}

function fail(...args) {
    let [code = -1, message, data] = args;

    if (args.length === 1) {
        message = args[0];
        code = -1;
        data = undefined;
    }

    // 如果message是一个错误，code默认为500
    if (message instanceof Error && code === -1) {
        code = 500;
    }

    const messages = getMessages(message, code);
    const firstMessage = messages[0];

    let httpCode = 400;
    if (code > 0 && code < 600) httpCode = code;

    // 使用throw，执行到throw时，此次请求就结束了，不必使用 return ctx.fail方式
    this.throw(httpCode, {
        isCtxFail: true,
        code,
        message: (typeof firstMessage === 'object' && 'message' in firstMessage) ? firstMessage.message : firstMessage,
        messages,
        data,
    });
}

function getMessages(msg, code) {
    if (!msg) return [codeMap[code]];

    if (Array.isArray(msg)) {
        let messages = [];

        msg.forEach(item => {
            if (typeof item === 'object') {
                if ('message' in item && 'field' in item) {
                    messages.push(item);
                } else {
                    messages = messages.concat(Object.values(item));
                }
            } else if (typeof item === 'string') {
                messages.push(item);
            }
        });

        return messages;
    }

    if (typeof msg === 'string') return [msg];

    if (msg instanceof Error) return [msg.message];

    return [];
}

module.exports = function (options, app) {
    return async function (ctx, next) {
        ctx.success = success;
        ctx.fail = fail;
        return next();
    };
};
