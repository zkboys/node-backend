import {Post, Put} from '../routes';

export default class ProductController {
    // 新增产品
    @Post('/products', {
        // swagger validate 配置
        // 前端传递给后端的数据，四个来源：headers, query, body, params
        // rules 为校验配置，其他为swagger配置
        // 配置是否写到 product_.js中？
        descriptor: {}, // 如果只编写了 descriptor 将根据ctx.method 判断 从 query 或者 body里获取数据
        headers: {},
        query: {},
        body: {
            name: {
                label: '产品名称',
                rules: [],
            },
        },
        params: {},
        body2: (ctx) => {
            return {
                name: {
                    label: '产品名称',
                    rules: [
                        {require: true, message: '产品名称不能为空！'},
                        {
                            asyncValidator: async (rule, value) => {
                                const exit = await ctx.$entity.Product.findOne({where: {name: value}});

                                if (exit && exit.id !== ctx.body.id) throw (new Error('产品名已被占用'));
                            },
                        },
                    ],
                },
            };
        },
    })
    static async save(ctx) {
        const body = ctx.request.body;
        const result = await ctx.$entity.Product.create(body);
        ctx.success(result);
    }

    @Put('/products')
    static async update(ctx) {
        const body = ctx.request.body;
        const result = await ctx.$entity.Product.update(body, {where: {id: body.id}});

        ctx.success(result);
    }
};
