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
    excludeFields: [], // 不给前端返回的字段
    excludeValidateFields: [], // 不参与后端校验的字段
    queryFields: ['account', {field: 'position', like: false}], // queryFields: [] 指定查询条件字段， like默认为true，进行模糊查询; queryFields: true 所有字段参与查询条件，默认为true
    // 实体间依赖关系 ，值为对应的模块名，支持数据，添加多个关联关系
    hasOne: 'User',
    hasMany: ['User', 'Role'],
    belongsTo: '',
    belongsToMany: {model: 'Menu', through: 'RoleMenu'}, // 多对多写法 ['', {model: '', through: ''}]  {model: '', through: ''}, 
}
```
## TODO
- [ ] API文档
- [x] jwt退出登录问题
- [x] 静态文件的缓存策略
- [ ] 接口数据校验
- [ ] 国际化
- [ ] 统一异常处理
