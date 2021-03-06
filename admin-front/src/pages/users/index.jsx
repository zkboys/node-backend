import React, {Component} from 'react';
import {Button, Modal, Form} from 'antd';
import PageContent from 'src/layouts/page-content';
import config from 'src/commons/config-hoc';
import {
    QueryBar,
    FormRow,
    FormElement,
    Table,
    Operator,
    Pagination,
} from 'src/library/components';
import EditModal from './EditModal';

export const position = [
    {value: 1, label: '员工'},
    {value: 2, label: 'CEO'},
];

@config({
    path: '/users',
    ajax: true,
})
export default class UserCenter extends Component {
    state = {
        loading: false,     // 表格加载数据loading
        dataSource: [],     // 表格数据
        selectedRowKeys: [],// 表格中选中行keys
        total: 0,           // 分页中条数
        pageNum: 1,         // 分页当前页
        pageSize: 20,       // 分页每页显示条数
        deleting: false,    // 批量删除中loading
        visible: false,     // 添加、修改弹框
        id: null,           // 需要修改的数据id
    };

    columns = [
        {title: '用户名', dataIndex: 'account', width: 200},
        {title: '职位', dataIndex: 'position', width: 200, render: value => position.find(item => item.value === value)?.label},
        {title: '角色', dataIndex: ['Role', 'name'], width: 200},
        {title: '备注', dataIndex: 'remark'},
        {
            title: '操作', dataIndex: 'operator', width: 100,
            render: (value, record) => {
                const {id, account} = record;
                const items = [
                    {
                        label: '编辑',
                        onClick: () => this.setState({visible: true, id}),
                    },
                    {
                        label: '删除',
                        color: 'red',
                        confirm: {
                            title: `您确定删除"${account}"?`,
                            onConfirm: () => this.handleDelete(id),
                        },
                    },
                ];

                return <Operator items={items}/>;
            },
        },
    ];

    componentDidMount() {
        this.form.submit();
    }

    handleSubmit = (values) => {
        if (this.state.loading) return;

        const {pageNum, pageSize} = this.state;
        const params = {
            ...values,
            pageNum,
            pageSize,
        };

        this.setState({loading: true});
        this.props.ajax.get('/users', params)
            .then(res => {
                const dataSource = res?.list || [];
                const total = res?.total || 0;

                this.setState({dataSource, total});
            })
            .finally(() => this.setState({loading: false}));
    };

    handleDelete = (id) => {
        if (this.state.deleting) return;

        this.setState({deleting: true});
        this.props.ajax.del(`/users/${id}`, null, {successTip: '删除成功！', errorTip: '删除失败！'})
            .then(() => this.form.submit())
            .finally(() => this.setState({deleting: false}));
    };

    handleBatchDelete = () => {
        if (this.state.deleting) return;

        const {selectedRowKeys} = this.state;
        const content = (
            <span>
                您确定删除
                <span style={{padding: '0 5px', color: 'red', fontSize: 18}}>
                    {selectedRowKeys.length}
                </span>
                条记录吗？
            </span>
        );
        Modal.confirm({
            title: '温馨提示',
            content,
            onOk: () => {
                this.setState({deleting: true});
                this.props.ajax.del('/users', {ids: selectedRowKeys.join(',')}, {successTip: '删除成功！'})
                    .then(() => this.form.submit())
                    .finally(() => this.setState({deleting: false}));
            },
        });
    };

    render() {
        const {
            loading,
            deleting,
            dataSource,
            selectedRowKeys,
            total,
            pageNum,
            pageSize,
            visible,
            id,
        } = this.state;

        const formProps = {
            width: 200,
        };
        const disabledDelete = !selectedRowKeys?.length;
        return (
            <PageContent>
                <QueryBar>
                    <Form
                        name="users"
                        onFinish={this.handleSubmit}
                        ref={form => this.form = form}
                    >
                        <FormRow>
                            <FormElement
                                {...formProps}
                                label="名称"
                                name="account"
                            />
                            <FormElement
                                {...formProps}
                                type="select"
                                label="职位"
                                name="position"
                                allowClear
                                options={position}
                            />
                            <FormElement layout>
                                <Button type="primary" htmlType="submit">提交</Button>
                                <Button onClick={() => this.form.resetFields()}>重置</Button>
                                <Button type="primary" onClick={() => this.setState({visible: true, id: null})}>添加</Button>
                                <Button danger loading={deleting} disabled={disabledDelete} onClick={this.handleBatchDelete}>删除</Button>
                            </FormElement>
                        </FormRow>
                    </Form>
                </QueryBar>

                <Table
                    rowSelection={{
                        selectedRowKeys,
                        onChange: selectedRowKeys => this.setState({selectedRowKeys}),
                    }}
                    loading={loading}
                    columns={this.columns}
                    dataSource={dataSource}
                    rowKey="id"
                    serialNumber
                    pageNum={pageNum}
                    pageSize={pageSize}
                />

                <Pagination
                    total={total}
                    pageNum={pageNum}
                    pageSize={pageSize}
                    onPageNumChange={pageNum => this.setState({pageNum}, () => this.form.submit())}
                    onPageSizeChange={pageSize => this.setState({pageSize, pageNum: 1}, () => this.form.submit())}
                />

                <EditModal
                    visible={visible}
                    id={id}
                    isEdit={id !== null}
                    onOk={() => this.setState({visible: false}, () => this.form.submit())}
                    onCancel={() => this.setState({visible: false})}
                />
            </PageContent>
        );
    }
}
