# 企业微信消息平台

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
```


## 命令行变量
NODE_ENV
PORT
JWT_SECRET

## 微信消息

### 纯文本消息

```javascript

{
    token: '消息标识', 
    type: 'text',
    content: '消息内容', // 最长不超过2048个字节，超过将截断；支持换行、以及A标签，即可打开自定义的网页（可参考以上示例代码）(注意：换行符请用转义过的\n)
}
```

### 文本卡片
```javascript
{
    token: '消息标识',
    type: 'card',
    title: '卡片标题', // 标题，不超过128个字节，超过会自动截断
    description: '卡片中的描述内容', // 不超过512个字节，超过会自动截断;支持使用br标签或者空格来进行换行处理，也支持使用div标签来使用不同的字体颜色，目前内置了3种文字颜色：灰色(gray)、高亮(highlight)、默认黑色(normal)，将其作为div标签的class属性即可
    url: '点击卡片跳转地址',
    btntxt: '详情',  // 按钮文字，默认 详情
}
```

### 图片消息
```javascript
{
    token: '消息标识',
    type: 'image',
    base64Code: 'data:image/jpeg;base64,xxxx', // 图片的base64数据，支持jpg、jpeg、png各式
}
```

### 图文消息
```javascript
{
    token: '消息标识',
    type: 'imageText',
    title: '标题', // 标题，不超过128个字节，超过会自动截断
    description: '描述', // 不超过512个字节，超过会自动截断
    url: '点击跳转链接',
    base64Code: 'data:image/jpeg;base64,xxxx', // 图片的base64数据，支持jpg、jpeg、png各式
}
```

### markdown 消息
```javascript
{
    token: '消息标识', 
    type: 'markdown',
    content: 'markdown内容', // markdown内容，最长不超过2048个字节，必须是utf8编码
}
```

### 图表网页 消息
```javascript
{
    token: '消息标识', 
    type: 'chartWeb',
    title: '我是个牛逼的图表', // 同card
    description: '消息说明', // 同 card
    btntxt: '详情', // 同 card
    charts: [
        {
            type: 'bar',
            title: '我是条形图',
            description: '我是这个图标说明',
            data: [
                {label: '北京', value: 20},
                {label: '上海', value: 40},
                {label: '广州', value: 15},
                {label: '深圳', value: 5},
                {label: '杭州', value: 2},
                {label: '天津', value: 22},
                {label: '其他', value: 8},
            ],
        },
        {
            type: 'line_multiple',
            title: '对比折线图',
            labelTickCount: 6, // 横轴标签个数
            valueTickCount: 10, // 纵轴标签个数
            data: [
                {type: '北京', label: '一月', value: 18.9},
                {type: '北京', label: '二月', value: 28.8},
                {type: '北京', label: '三月', value: 39.3},
                {type: '上海', label: '一月', value: 12.4},
                {type: '上海', label: '二月', value: 23.2},
                {type: '上海', label: '三月', value: 34.5},
            ],
        },   
    ],
}
```

### 图表图片 消息
```javascript
{
    type: 'chartImage',
    // 其他属性 同 chartWeb
}
```
### 网页图片
```javascript
{
    token: '消息标识', 
    type: 'webImage',
    url: 'https://www.baidu.com',
    width: 320, // 默认320
}
```

## 前后端一起部署要解决的问题
1. 后端提供web容器，可以访问静态文件即可
1. 前端构建时候的PUBLIC_URL指定
1. 所有的get请求，如果未匹配路由，统一返回index.html,最后能同时要区分ajax请求返回404
1. 静态文件的缓存策略，spa页面静态文件可以设置为强缓存

## TODO
- [ ] API文档
- [x] jwt退出登录问题
- [ ] 静态文件的缓存策略
- [ ] 生产环境是否需要先通过 babel编译？还是直接使用babel-node即可？ babel-node 不能用于生产环境！因为 babel-node 会加载更多资源和模块，使得运行环境变「重」

- [ ] 新建业务维度tab，表格形式，与项目表格相同，显示 一级业务、二级业务、系统名称、部门、成本，无操作
- [ ] 项目表格：成本列调整到系统名称后
- [ ] 编辑表单，添加 硬盘大小、内存大小、CPU个数与成本联动、（只有设备类型是虚拟机的才联动计算）
- [ ] 新建全局设置，硬盘大小、内存大小，CPU个数成本配置以及统一修改成本功能。


## 核算成本

1. 只有app类型计算核算成本
1. 非app类型系统，计算被依赖数量时，只计算app类型
1. 非APP类型，如果没有被任何系统依赖，总成本为自身成本，有被其他系统依赖，总成本为0


## entity配置

```javascript
module.exports = {
    attributes: {
        field: {
            rules: [], // 校验规则
        }
    },
    options: {},
    excludeFields: [], // 不给前端返回的字段
    excludeValidateFields: [], // 不参与后端校验的字段
}
```
