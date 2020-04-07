create table redis_storage
(
    id        int auto_increment primary key,
    r_key     varchar(500) not null,
    r_value   text         null,
    updatedAt timestamp    null,
    createdAt timestamp    null
) comment '模拟redis数据存储表';

create table user
(
    id        int auto_increment primary key,
    password  varchar(100) not null,
    updatedAt timestamp    null,
    createdAt timestamp    null,
    account   varchar(20)  null
) comment '用户基础表';

# 创建用户 admin/111
INSERT INTO `user` (`id`, `account`, `password`, `createdAt`, `updatedAt`)
VALUES (DEFAULT, 'admin', '$2a$08$RE0ux8KuSSlrfz8QaxQj4OwKIxoZD.9.WBOMYFjP6spz4sZD7uTDO', NOW(), NOW());
