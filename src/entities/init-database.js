// 初始化数据
export default async function (entities) {
    const {User, Role, Menu} = entities;

    let role = await Role.findOne();
    if (!role) {
        role = await Role.create({
            name: '管理员',
            description: '管理员拥有所有权限',
        });
    }

    const user = await User.findOne();
    if (!user) {
        await role.createUser({
            account: 'admin',
            password: '111',
            email: '888@88.com',
            position: '2',
        });
    }

    const menu = await Menu.findOne();
    if (!menu) {
        [
            {
                text: '产品',
                icon: 'ant-design',
                path: '/products',
                order: 3000,
            },
            {
                text: 'Ant Design 官网',
                icon: 'ant-design',
                url: 'https://ant-design.gitee.io',
                target: '',
                order: 2000,
            },
            {
                text: '文档',
                icon: 'book',
                url: 'https://open.vbill.cn/react-admin',
                target: '_blank',
                order: 1200,
            },
            {
                text: '自定义头部',
                icon: 'api',
                path: '/example/customer-header',
                order: 998,
            },
            {
                text: '用户管理',
                icon: 'user',
                path: '/users',
                order: 900,
            },
            {
                text: '角色管理',
                icon: 'lock',
                path: '/roles',
                order: 900,
            },
            {
                text: '菜单管理',
                icon: 'align-left',
                path: '/menu-permission',
                order: 900,
            },
            {
                text: '代码生成',
                icon: 'code',
                path: '/gen',
                order: 900,
            },
            {
                text: '404页面不存在',
                icon: 'file-search',
                path: '/404',
                order: 700,
            },
            {
                id: 'example',
                text: '示例',
                icon: 'align-left',
                order: 600,
            },
            {
                parentId: 'example',
                text: '可编辑表格',
                icon: 'align-left',
                path: '/example/table-editable',
                order: 600,
            },
        ].forEach(menu => {
            if (!menu.type) menu.type = '1';
            role.createMenu(menu);
        });
    }
};
