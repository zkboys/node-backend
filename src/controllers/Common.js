import _ from 'lodash';
import config from 'config';
import jwt from 'jsonwebtoken';
import svgCaptcha from 'svg-captcha';
import uuid from 'uuid';

import {Api, Get, Post} from '../routes/decorator-routes';
import {redis} from '../util';
import passwordUtil from '../util/password-util';
import userEntityConfig from '../entities/User';

const jwtSecret = config.get('jwt.secret');
const jwtExpire = config.get('jwt.expire');
const jwtCookieName = config.get('jwt.cookieName');

const reqUser = {
    account: {
        description: '账号',
        required: true,
    },
    password: {
        description: '密码',
        required: true,
    },
};

const resUser = userEntityConfig.toSwagger();
const loginResUser = {
    ...resUser,
    token: '登录凭证',
};

@Api('通用接口')
export default class CommonController {
    // static routePrefix = 'user';

    // 新用户注册
    @Post('/register', {
        body: reqUser,
        object200: resUser,
    })
    static async register(ctx) {
        const account = ctx.checkBody('account').label('用户名').notEmpty().len(4, 20).value;
        const password = ctx.checkBody('password').label('密码').notEmpty().len(3, 20).value;

        if (ctx.errors) ctx.fail(ctx.errors);

        const user = await ctx.$entity.User.findOne({where: {account}});

        if (user) ctx.fail('账号已被使用');

        const createdUser = await ctx.$entity.User.create({
            account,
            password: password,
        });

        ctx.success(_.omit(createdUser, userEntityConfig.excludeFields));
    }

    // 用户登录
    @Post('/login', {
        body: reqUser,
        object200: loginResUser,
    })
    static async login(ctx) {
        const account = ctx.checkBody('account').label('用户名').notEmpty().value;
        const password = ctx.checkBody('password').label('密码').notEmpty().value;

        if (ctx.errors) ctx.fail(ctx.errors);

        //  图片验证码 开发环境下不进行校验
        if (
            process.env.NODE_ENV !== 'development' &&
            process.env.NODE_ENV !== 'test'
        ) {
            const captcha = ctx.checkBody('captcha').notEmpty().value;
            const captchaId = ctx.checkBody('captchaId').notEmpty().value;

            const redisCaptcha = await redis.get(`captchaId${captchaId}`);
            await redis.del(`captchaId${captchaId}`);

            if (redisCaptcha?.toLowerCase() !== captcha?.toLowerCase()) {
                ctx.fail('验证码不正确');
            }
        }

        const errorMessage = '用户名或密码错误';

        let user = await ctx.$entity.User.findOne({where: {account}});
        const verifyPassword = user && passwordUtil.compare(password, user.password);

        if (!verifyPassword || !user) {
            ctx.fail(errorMessage);
        }

        user = user.toJSON();

        // expiresIn 单位 秒
        const token = jwt.sign({id: user.id}, jwtSecret, {expiresIn: jwtExpire});
        user.token = token;

        ctx.cookies.set(jwtCookieName, token,
            {
                maxAge: jwtExpire * 1000, // cookie有效时长 单位 毫秒s
                httpOnly: true, // 是否只用于http请求中获取
                overwrite: false, // 是否允许重写
            },
        );

        // 存储到redis，退出登录会用到
        await redis.set(token, token);

        return ctx.success(_.omit(user, userEntityConfig.excludeFields));
    }

    // 退出登录
    @Post('/logout')
    static async logout(ctx) {
        const token = ctx.state.validateToken;

        redis.del(token);

        ctx.cookies.set(jwtCookieName, null);

        ctx.success();
    }

    //  修改密码
    @Post('/changePassword', {
        body: {
            id: {
                description: '用户id',
                required: true,
            },
            oldPassword: {
                description: '旧密码',
                required: true,
            },
            newPassword: {
                description: '新密码',
                required: true,
            },
        },
    })
    static async changePassword(ctx) {
        const id = ctx.checkBody('id').label('用户id').notEmpty().value;
        const oldPassword = ctx.checkBody('oldPassword').label('旧密码').notEmpty().value;
        const newPassword = ctx.checkBody('newPassword').label('新密码').notEmpty().value;
        if (ctx.errors) ctx.fail(ctx.errors);

        const user = await ctx.$entity.User.findOne({where: {id}});
        if (!user) ctx.fail('用户不存在');

        //  验证旧密码
        const verifyPassword = passwordUtil.compare(oldPassword, user.password);
        if (!verifyPassword) ctx.fail('原密码不正确！');

        //  新密码不能与旧密码相同
        const isSamePassword = passwordUtil.compare(newPassword, user.password);
        if (isSamePassword) ctx.fail('新旧密码不能相同，请重新设置！');

        await ctx.$entity.User.update({password: newPassword}, {where: {id}});

        // 修改密码成功之后，直接退出登录了
        this.logout(ctx);
    }

    // 生成图片验证码
    @Get('/getCaptcha')
    static async getCaptcha(ctx) {
        const captchaId = uuid();
        const captcha = svgCaptcha.create({
            size: 5,
            fontSize: 50,
            noise: 3,
            width: 120,
            height: 41,
            background: '#fff',
        });

        const {data, text} = captcha;

        redis.set(`captchaId${captchaId}`, text);

        ctx.success({
            captcha: data,
            captchaId,
        });
    }
};
