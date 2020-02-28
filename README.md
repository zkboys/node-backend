# node 后端

## 相关资料
1. [koa](https://github.com/koajs/koa)
1. [缓存：redis](https://github.com/luin/ioredis)
1. [数据库：sequelize](https://sequelize.org/v5/)

## 安装依赖
```
yarn
```

## 启动
```
# 开发
yarn start

# 生产
yarn pro
```

## 命令行变量
NODE_ENV
PORT
JWT_SECRET

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

