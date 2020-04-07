'use strict';
/**
 * 字段过滤，有些字段不需要展示给前端，这里只编写需要展示的字段
 * 通过_.pick(object, paths)配合使用
 * */
export default {
    user: ['id', 'account', 'token'],
};
