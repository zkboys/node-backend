'use strict';

const _ = require('lodash');

const {Project} = require('../models');
const ft = require('../models/fields_table');
const {GroupProxy, UserGroupProxy, UserProjectProxy} = require('../proxy');

module.exports = class GroupController {
    /**
     * 创建团队
     * @param Object ctx
     */

    static async create(ctx) {
        const name = ctx.checkBody('name').notEmpty().len(3, 16).value;
        const uid = ctx.state.user.id;

        if (ctx.errors) {
            return ctx.fail(null, 10001, ctx.errors);
        }

        const doc = await GroupProxy.findByName(name);

        if (doc) {
            return ctx.fail(`团队 ${name} 已存在`);
        }

        await GroupProxy.newAndSave({user: uid, name});

        return ctx.success();
    }

    /**
     * 获取团队列表
     * @param Object ctx
     */

    static async list(ctx) {
        const uid = ctx.state.user.id;
        const keywords = ctx.query.keywords;
        let groups;

        if (keywords) {
            groups = await GroupProxy.find({name: keywords});
            groups = groups.map(o => _.pick(o, ft.group));
        } else {
            groups = await UserGroupProxy.find({user: uid});
            groups = groups.map(o => _.pick(o.group, ft.group));
        }

        ctx.success(groups);
    }

    /**
     * 加入团队
     * @param Object ctx
     */

    static async join(ctx) {
        const uid = ctx.state.user.id;
        const id = ctx.checkBody('id').notEmpty().value;

        if (ctx.errors) {
            ctx.fail(null, 10001, ctx.errors);
            return;
        }

        await UserGroupProxy.newAndSave({user: uid, group: id});

        ctx.success();
    }

    /**
     * 删除团队
     * @param Object ctx
     */

    static async delete(ctx) {
        const uid = ctx.state.user.id;
        const id = ctx.checkBody('id').notEmpty().value;

        if (ctx.errors) {
            ctx.fail(null, 10001, ctx.errors);
            return;
        }

        const group = await GroupProxy.findOne({_id: id, user: uid});
        const projects = await Project.find({group: id});
        const projectIds = projects.map(project => project.id);

        if (group) { // 团队创建者删除团队
            if (projects.length > 0) {
                ctx.fail('解散团队前请先删除该团队下所有的项目');
                return;
            }
            await GroupProxy.del({_id: id});
            await UserGroupProxy.del({group: id});
        } else { // 团队成员离开团队
            await UserGroupProxy.del({user: uid, group: id});
            await UserProjectProxy.del({user: uid, project: {$in: projectIds}});
        }

        ctx.success();
    }

    /**
     * 团队信息更新
     * @param Object ctx
     */

    static async update(ctx) {
        const uid = ctx.state.user.id;
        const id = ctx.checkBody('id').notEmpty().value;
        const name = ctx.checkBody('name').notEmpty().len(3, 16).value;

        if (ctx.errors) {
            ctx.fail(null, 10001, ctx.errors);
            return;
        }

        let group = await GroupProxy.findOne({_id: id, user: uid});

        if (!group) {
            ctx.fail('非团队创建者无法更新团队信息');
            return;
        }

        group = await GroupProxy.findByName(name);

        if (group) {
            ctx.fail(`团队 ${name} 已存在`);
            return;
        }

        await GroupProxy.updateById(id, {name});

        ctx.success();
    }
};
