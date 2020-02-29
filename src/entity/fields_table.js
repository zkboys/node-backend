'use strict';
/**
 * 字段过滤，有些字段不需要展示给前端，这里只编写需要展示的字段，通过_.pick(object, paths)配合使用
 * */
export default {
    group: ['_id', 'name'],
    projectExtend: ['_id', 'is_workbench'],
    user: ['id', 'name', 'nick_name', 'head_img', 'token', 'createdAt', 'updatedAt'],
    mock: ['_id', 'url', 'method', 'description', 'mode', 'parameters', 'response_model'],
    project: ['_id', 'name', 'url', 'description', 'swagger_url', 'members', 'extend', 'group'],
};
