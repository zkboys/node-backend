import {Post, Put, Get, Api} from '../routes/decorator-routes';

const formData = {
    id: {
        type: 'string', // 默认 string string integer array object file  boolean
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
            {
                length: 20,
                message: '长度必须是20',
            },
        ],
    },
    names: {
        type: 'array',
        items: {
            type: 'string',
        },
    },
};

@Api({
    tags: {
        name: '商品',
        description: '模块的描述',
    },
    middleware: [ // 调用顺序 类级别中间件 -> 方法级别中间件 -> 方法
        async function (ctx, next) {
            console.log('调用了类级别中间件');
            await next();
        },
    ],
})
export default class ProductController {
    @Get('/products', {
        tags: '妈的',
        middleware: [
            async function (ctx, next) {
                console.log('调用了方法级别中间件');
                ctx.products = [
                    {
                        id: '123',
                        name: '中间件产品',
                        description: '中间件里面的描述',
                    },
                ];
                await next();
            },
        ],
    })
    static async getAll(ctx) {
        console.log('调用了方法');
        const result = await ctx.$entity.Product.findAll();

        return ctx.success({
            total: 1,
            list: [...ctx.products, ...result],
        });
    }

    // 新增产品
    @Post('/products', {
        tags: '妈的',

        // swagger validate 配置
        // 前端传递给后端的数据来源：header, path, query, body, formData
        // swagger 的 parameters 定义 object 或者 function(ctx)
        header: {
            token: {
                type: 'string',
                description: '登录token',
                example: 'xxx',
            },
        },
        path: {
            id: {
                type: 'string',
                description: '商品id',
                example: 'xxx',
            },
        },
        query: {
            id: {
                type: 'string',
                description: '商品id',
                example: 'xxx',
            },
        },
        formData: formData,
        body: {
            product: {
                type: 'object',
                description: '商品啥的',
                properties: formData, // 组合方式
            },
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
                    {
                        length: 20,
                        message: '长度必须是20',
                    },
                ],
            },
            names: {
                type: 'array',
                items: {
                    type: 'string',
                },
                // rules 可以是个函数
                rules: (ctx) => {
                    return [];
                },
            },
        },

        // tags: [], // 标签，分类，默认类装饰器中获取 或者 类名
        summary: '接口摘要',
        description: '接口描述',
        // consumes: [ // 请求数据类型，默认 application/json
        //     'application/json',
        // ],
        produces: [ // 返回数据类型 默认 application/json
            'application/json',
        ],
        responses: { // 直接定义 200.schema description默认成功

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
