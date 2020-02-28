'use strict';

const _ = require('lodash');
const config = require('config');
const jwt = require('jsonwebtoken');

const util = require('../util');
const ft = require('../entity/fields_table');
const {User} = require('../entity');

const jwtSecret = config.get('jwt.secret');
const jwtExpire = config.get('jwt.expire');
const jwtCookieName = config.get('jwt.cookieName');

module.exports = class UserController {
    // 新用户注册
    static async register(ctx) {
        const name = ctx.checkBody('name').label('用户名').notEmpty().len(4, 20).value;
        const password = ctx.checkBody('password').label('密码').notEmpty().len(3, 20).value;

        if (ctx.errors) return ctx.fail(null, 10001, ctx.errors);

        const user = await User.findOne({where: {name}});

        if (user) return ctx.fail('用户名已被使用');

        const newPassword = util.bhash(password);

        const createdUser = await User.create({name, password: newPassword});

        ctx.success(createdUser);
    }

    // 用户登录
    static async login(ctx) {
        const name = ctx.checkBody('name').notEmpty().value;
        const password = ctx.checkBody('password').notEmpty().value;
        if (ctx.errors) return ctx.fail(null, 10001, ctx.errors);

        const errorMessage = '用户名或密码错误';

        const user = await User.findOne({where: {name}});
        if (!user) return ctx.fail(errorMessage);

        const verifyPassword = util.bcompare(password, user.password);
        if (!verifyPassword) return ctx.fail(errorMessage);

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

        return ctx.success(_.pick(user, ft.user));
    }

    // 查询所有用户
    static async findAll(ctx) {
        const users = await User.findAll();

        ctx.success(users.map(user => _.pick(user, ft.user)));
    }
};
