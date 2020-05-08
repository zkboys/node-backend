import React, {Component} from 'react';
import {Form} from 'antd';
import {FormElement} from 'src/library/components';
import config from 'src/commons/config-hoc';
import {ModalContent} from 'src/library/components';
import {position} from './';

@config({
    ajax: true,
    modal: {
        title: props => props.isEdit ? '修改用户' : '添加用户',
    },
})
export default class EditModal extends Component {
    state = {
        loading: false, // 页面加载loading
        data: {},       // 回显数据
        roles: [],
    };

    componentDidMount() {
        const {isEdit} = this.props;

        if (isEdit) {
            this.fetchData();
        }

        this.fetchRoles();
    }

    fetchRoles = () => {
        this.setState({loading: true});
        this.props.ajax.get('/roles')
            .then(res => {
                this.setState({roles: res});
            })
            .finally(() => this.setState({loading: false}));
    };

    fetchData = () => {
        if (this.state.loading) return;

        const {id} = this.props;

        this.setState({loading: true});
        this.props.ajax.get(`/users/${id}`)
            .then(res => {
                this.setState({data: res});
                // 不处理null，下拉框不显示placeholder
                Object.entries(res).forEach(([key, value]) => {
                    if (value === null) res[key] = undefined;
                });

                this.form.setFieldsValue(res);
            })
            .finally(() => this.setState({loading: false}));
    };

    handleSubmit = (values) => {
        if (this.state.loading) return;

        const {isEdit} = this.props;
        const ajaxMethod = isEdit ? this.props.ajax.put : this.props.ajax.post;
        const successTip = isEdit ? '修改成功！' : '添加成功！';

        if (!values.password)
            this.setState({loading: true});
        ajaxMethod('/users', values, {successTip})
            .then(() => {
                const {onOk} = this.props;
                onOk && onOk();
            })
            .finally(() => this.setState({loading: false}));
    };

    render() {
        const {isEdit} = this.props;
        const {loading, data, roles} = this.state;
        const formProps = {
            labelWidth: 100,
        };
        return (
            <ModalContent
                loading={loading}
                okText="保存"
                cancelText="重置"
                onOk={() => this.form.submit()}
                onCancel={() => this.form.resetFields()}
            >
                <Form
                    name="user-edit"
                    ref={form => this.form = form}
                    onFinish={this.handleSubmit}
                    initialValues={data}
                >

                    {isEdit ? <FormElement {...formProps} type="hidden" name="id"/> : null}

                    <FormElement
                        {...formProps}
                        label="账户"
                        name="account"
                        required
                        noSpace
                    />
                    <FormElement
                        {...formProps}
                        label="密码"
                        name="password"
                        required
                        noSpace
                    />
                    <FormElement
                        {...formProps}
                        type="email"
                        label="邮箱"
                        name="email"
                        noSpace
                    />
                    <FormElement
                        {...formProps}
                        type="select"
                        label="职位"
                        name="position"
                        allowClea
                        options={position}
                    />
                    <FormElement
                        {...formProps}
                        type="select"
                        showSearch
                        optionFilterProp='children'
                        label="角色"
                        name="roleId"
                        options={roles.map(item => ({value: item.id, label: item.name}))}
                    />
                    <FormElement
                        {...formProps}
                        type="textarea"
                        label="描述"
                        name="remark"
                        rows={4}
                    />
                </Form>
            </ModalContent>
        );
    }
}

