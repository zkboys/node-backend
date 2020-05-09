import {Post, Put} from '../routes/decorator-routes';

/* @Api({
    prefix: '/products',
    tags: ['商品'],
    tags: '商品',
})

@Api('商品') -> tags: ['商品']
*/
export default class ProductController {
    // 新增产品
    @Post('/products', {
        // swagger validate 配置
        // 前端传递给后端的数据来源：header, path, query, body, formData
        // swagger 的 parameters 定义 object 或者 function(ctx)
        header: {},
        path: {},
        query: {},
        formData: {},
        body: {
            id: {
                type: 'integer', // 默认 string string integer array object file  boolean
                description: '描述',
                example: 'xxx',

                format: 'int64', // date-time 如果是正则，可以加入 rules: pattern
                required: true, // 如果不存在，从rules中获取
                enum: [ // 枚举 也可以和rules关联
                    'available',
                    'pending',
                    'sold',
                ],
                rules: [ // async-validator 校验规则
                    {
                        required: true,
                        message: 'id不能为空',
                    }, // 如果不存在，从上成required: true获取
                ],
            },
            names: {
                type: 'array',
                items: {
                    type: 'string',
                },
            },
        },

        tags: [], // 标签，分类，默认类装饰器中获取 或者 类名
        summary: '接口摘要',
        description: '接口描述',
        consumes: [ // 请求数据类型，默认 application/json
            'application/json',
        ],
        produces: [ // 返回数据类型 默认 application/json
            'application/json',
        ],
        responses: { // 直接定义 200.schema description默认成功

        },

        body2: (ctx) => {
            return {
                name: {
                    label: '产品名称',
                    rules: [
                        {
                            require: true,
                            message: '产品名称不能为空！',
                        },
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
