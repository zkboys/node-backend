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

function fail(message, code = -1, data = null) {
    const messages = getMessages(message, code);
    const firstMessage = messages[0];

    this.response.status = 400;
    this.body = {
        code,
        message: (typeof firstMessage === 'object' && 'message' in firstMessage) ? firstMessage.message : firstMessage,
        messages,
        data,
    };
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
}

module.exports = function (options, app) {
    return async function (ctx, next) {
        ctx.success = success;
        ctx.fail = fail;
        return next();
    };
};
