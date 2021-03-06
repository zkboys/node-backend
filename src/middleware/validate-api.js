const AsyncValidator = require('async-validator').default;
const {setPropertiesDefaultValue} = require('../routes/swagger-json');

/**
 * 接口装饰器校验中间件
 *      接口装饰器使用的中间件，用来校验接口参数
 *      校验规则只从接口装饰器配置中获取，不从entity配置中获取
 *      entity 中的校验规则有entity层面进行校验
 * @param options 接口完整配置
 * @returns {function(...[*]=)}
 */
module.exports = (options) => async (ctx, next) => {
    const {
        header,
        path,
        query,
        body,
        formData,
    } = options;

    for (const [key, value] of Object.entries({
        header,
        path,
        query,
        body,
        formData,
    })) {
        if (!value) continue;

        setPropertiesDefaultValue(value);

        let data = {};
        if (key === 'query') data = ctx.query;
        if (key === 'header') data = ctx.request.header;
        if (key === 'path') data = ctx.params;
        if (key === 'body') data = ctx.request.body;
        if (key === 'formData') data = ctx.request.formData; // TODO ?

        // data 为空
        if (!Object.keys(data || {}).length) {
            data = {};
        }

        const descriptor = {};

        for (const [field, opt] of Object.entries(value)) {
            let rules = opt.rules || [];

            if (typeof rules === 'function') rules = await rules(ctx);

            const {
                required,
                description,
                enum: enumRules,
            } = opt;
            const label = description || field;

            if (required && !rules.find(item => ('required' in item))) {
                rules.push({
                    required: true,
                    message: `${key}中参数「${label}」不能为空！`,
                });
            }

            if (enumRules && !rules.find(item => ('enum' in item))) {
                rules.push({
                    type: 'enum',
                    enum: enumRules,
                    message: `${key}中参数「${label}」必须为[${enumRules.join()}]其中之一！`,
                });
            }

            descriptor[field] = rules;
        }

        // 进行校验，发现一个错误，立即throw
        const validator = new AsyncValidator(descriptor);
        try {
            await validator.validate(data);
        } catch (error) {
            const {errors: errs} = error;

            // 校验错误
            if (errs) ctx.throw(400, {isValidateError: true, message: errs[0].message, messages: errs});

            // 不知道发生了什么错误
            ctx.throw(500, error);
        }
    }

    await next();
};
