# node 后端

## 相关资料
1. [koa](https://github.com/koajs/koa)
1. [缓存：redis](https://github.com/luin/ioredis)
1. [数据库：sequelize](https://sequelize.org/v5/)

## 安装依赖
```
yarn
```

## 开发启动
```
yarn start
```

## 生产启动
```
# 先构建 如果需要前后端一起构建，使用 yarn build:all
yarn build

# 启动
yarn pro

# 使用pm2
pm2 start ecosystem.config.js
```

## 命令行变量
`NODE_ENV`
`PORT`
`JWT_SECRET`

## entity配置

定义entity，自动创建数据库（开发），直接提供如下restful接口：

| 方法 | 路由 | 说明 | 示例 |
|  ----  | ----------- | ------- |  ----  |
| GET    | /:model     | 查询所有 | /users?pageNum=1&pageSize=10&name=tom |
| GET    | /:model/:id | 根据id查询 | /users/1 | 
| GET    | /one/:model | 查询一条数据 | /one/users?name=tom |
| POST   | /:model     | 添加，body支持数组，批量添加 | /users | 
| PUT    | /:model     | 修改 | /users |
| DELETE | /:model/:id | 根据id删除一条数据 | /users/1 |
| DELETE | /:model     | 根据一组ids，删除数据 | /users?ids=1,2,3 |  

### 查询所有（`get /:model `）说明：

- 如果传递 `pageNum` `pageSize` 参数，将分页查询，返回`{total, list}`，否则查询全部，返回`[{}, {}, ...]`;
- 除 `pageNum` `pageSize` 参数，其他参数将作为查询条件，如果参数key以 `Id`结尾，将精确查询，否者模糊查询，返回`[{}, {}, ...]`；

### 关联查询`include`参数说明

所有的GET方法，如果实体有多表关联关系，将进行关联查询，传递`include=false`参数之后，将禁用关联查询；


### entity文件说明：
entity文件命名规范：大写驼峰式命名，比如：`User.js` `RoleMenu.js`

```javascript
module.exports = {
    name: '', // 实体名称，会作为表的comment，也会作为swagger.tags.name
    description: '', // 描述，作为swagger.tags.description
    attributes: { // 参考 sequelize
        id: {
            type: UUID,
            allowNull: false,
            primaryKey: true,
            unique: true,
            defaultValue: UUIDV4,
        },
        account: {
            type: STRING(50),
            allowNull: false,
            comment: '账号 必填', // 空格隔开，第一部分为label 其他未任意说明
            enum:[], // 枚举值
            example: '', // 示例
            rules: [], // 校验规则 使用 https://github.com/yiminghe/async-validator
        },
        password: {
            type: STRING(100),
            allowNull: false,
            comment: '密码',
            set(val) {
                this.setDataValue('password', passwordUtil.encode(val));
            },
        },
    },
    options: {}, // 参考 sequelize
    forceSync: true, // 开发时，强制同步数据库
    commonApi: false, // 此实体是否提供通用restful接口，默认true
    excludeFields: [], // 不给前端返回的字段
    excludeValidateFields: [], // 不参与后端校验的字段
    queryFields: ['account', {field: 'position', like: false, required: true}], // queryFields: [] 指定查询条件字段， like默认为true，进行模糊查询; queryFields: true 所有字段参与查询条件，默认为true
    // 实体间依赖关系 ，值为对应的模块名，支持数据，添加多个关联关系
    hasOne: 'User',
    hasMany: ['User', 'Role'],
    belongsTo: '',
    belongsToMany: {model: 'Menu', through: 'RoleMenu'}, // 多对多写法 ['', {model: '', through: ''}]  {model: '', through: ''}, 
}
```
## 接口相关装饰器
系统提供了几个装饰器，用于路由约定、swagger文档生成、请求参数校验

### swagger基础配置
部分基础配置会从`config`、`package.json`中获取，参考如下：
```javascript
const {
    version,
    name: title,
    description,
} = require('../../package.json');
const {
    swagger,
    apiBasePath = '',
    swaggerVersion,
    externalDocs,
    schemes,
} = require('config');

const swaggerJson = { // swagger json 数据
    swagger: swaggerVersion,
    info: { // 项目基本信息，从 package.json中获取
        version,
        title: `${title} - 接口文档`,
        description,
    },
    externalDocs,
    basePath: apiBasePath,
    schemes,
    tags: [],
    paths: {},
};
```

### @Api
类装饰器，用于装饰controller类

简化写法
```javascript
@Api('当前模块名')
```
完整写法
```javascript
@Api({
    prefix: '/users', // 当前类中所有接口的统一前缀，默认：''
    tags: '当前模块名', // 对应swagger的tags，并且当前所有接口都属于此tags，默认：类名
    // tags: { // 完整的tags写法
    //     name: '模块名',
    //     description: '模块描述',
    //     externalDocs: {
    //         description: '更多模块信息请查看：',
    //         url: 'http://swagger.io',
    //     },
    // },
    // tags: ['模块1', {...}], // 支持数组写法
    middleware: [], // 类级别中间件，会应用到每一个接口上，优先于接口上的中间件
})
```

## 接口方法装饰器
提供了5个装饰器：
`@Get`
`@Post`
`@Put`
`@Del`
`@Patch`，每个装饰器参数相同，说明如下：

```javascript
@Get(path, { // path: 路由地址，比如：/users; 最终地址：{config.apiBasePath}/{@Api.prefix}/{path}
    tags: '', // 支持数组：['', '']，当前接口标签，会合并类tags；如果缺省，默认使用类tags或类名 
    summary: '接口摘要说明',
    description: '接口详细描述',
    
    // 前端传递参数来源主要有：header, path, query, body, formData，分别定义
    header: {},
    path: {},
    query: {},
    body: {},
    formData: {},    

    consumes: [], // 请求数据类型，默认：['application/json']，如果存在formData属性，默认为：['application/x-www-form-urlencoded']
    produces: [], // 返回数据类型，默认：['application/json']
    responses: { // 接口返回描述，默认如下：
        200: {
            description: '成功',
        },
        400: {
            // 太多了，参见 src/routes/swagger-json.js
        }       
    }, 
})
```
接口返回值如果是对象，或者对象数组，可使用如下方式定义
```javascript
{
    object200: {
        name: {
            type: 'string',
            description: '用户名',
        },
    },
    array200: {
        name: {
            type: 'string',
            description: '用户名',
        },
    },
}
```

前端参数（header, path, query, body, formData）说明：

swagger官方文档 [https://swagger.io/docs/specification/2-0/describing-parameters/](https://swagger.io/docs/specification/2-0/describing-parameters/)

以body为例(其他配置相同) 常用配置如下：
```javascript
{
    body: {
        name: { // 对象的key(name)作为字段名
            type: 'integer', // 字段类型，默认：'string'；可用类型有： string integer array object file boolean
            description: '描述', // 字段描述 
            example: 'xxx', // 字段示例
            default: 10, // 默认值
    
            format: 'int64', // 数据格式：date-time 如果是正则，可以加入 rules: pattern
            required: true, // 是否必填
            enum: [ // 枚举
                'available',
                'pending',
                'sold',
            ],
            // 如果type为array，通过items描述每一项的定义
            items: {
                type: 'string',
            },
                
            items: {
                type: 'object',
                description: '字段描述',
                properties: {}, // 没一项的字段定义
            },
            // async-validator 校验规则，上面的 format、required、enum会自动关联到rules中
            // https://github.com/yiminghe/async-validator
            rules: [ 
                {
                    required: true,
                    message: 'id不能为空',
                }, // 如果不存在，从上成required: true获取
            ],
            // 可以是函数（支持async），返回值作为字段的rules配置
            rules: (ctx) => {
                return [];
            },
        },
        product: {
            type: 'object',
            description: '字段描述',
            properties: fields, // 组合其他字段配置方式
        },
    }
}
```


## TODO
- [x] jwt后端退出登录问题；
- [x] 静态文件的缓存策略；
- [x] 国际化 暂不支持，具体项目需要时再添加；
- [x] 统一异常处理；
- [ ] swagger文档
    - [x] 装饰器方式
    - [x] :id -> {id} 问题
    - [ ] 与async-validate结合，进行前端提交数据校验
    - [ ] 通用restful接口，统一生成swagger文档，排除被覆盖情况
    - [ ] 更换ui模板，原生的太丑，太难用 https://github.com/xiaoymin/swagger-bootstrap-ui
