const {Op} = require('sequelize');

// 通用的rest full 接口
export default class RestFullController {
    // 获取列表
    static async get(ctx) {
        const {pageNum, pageSize, ...others} = ctx.query;

        // 查询条件
        const conditions = [];

        Object.entries(others).forEach(([key, value]) => {
            // 也许是id 精确查询
            if (key.endsWith('Id')) {
                conditions.push({[key]: value});
            } else {
                // 模糊查询
                conditions.push({[key]: {[Op.like]: `%${value.trim()}%`}});
            }
        });

        const conditionsObj = {
            where: {
                [Op.and]: [conditions],
            },
            order: [
                ['updatedAt', 'DESC'],
            ],
        };

        // TODO 如何实现关联查询
        // 含有分页参数，为分页查询
        if (pageNum && pageSize) {
            conditionsObj.offset = (pageNum - 1) * pageSize;
            conditionsObj.limit = +pageSize;
            const {count, rows} = await ctx.$entityModel.findAndCountAll(conditionsObj);

            return ctx.success({total: count, list: rows});
        } else {
            const result = await ctx.$entityModel.findAll(conditionsObj);
            ctx.success(result);
        }
    }

    //  获取详情
    static async getById(ctx) {
        const {id} = ctx.params;

        const result = await ctx.$entityModel.findByPk(id);

        ctx.success(result);
    }

    // 新增
    static async post(ctx) {
        const body = ctx.request.body;
        // TODO 校验
        const result = await ctx.$entityModel.create(body);

        ctx.success(result);
    }

    // 修改
    static async put(ctx) {
        const body = ctx.request.body;
        const result = await ctx.$entityModel.update(body, {where: {id: body.id}});

        ctx.success(result);
    }
};
