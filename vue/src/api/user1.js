/**
 * 新增
 * /user/add
 * 删除
 * /user/delete
 * /user/delete/batch
 * 编辑
 * /user/update
 * 查询
 * /user/selectById
 * 查询所有
 * /user/selectAll
 * 分页查询
 * /user/selectPage
 */

import request from '@/utils/request';

// 新增用户
export function addUser(data) {
    return request({
        url: '/user/add',
        method: 'post',
        data
    });
}

// 删除用户
export function deleteUser(id) {
    return request({
        url: '/user/delete',
        method: 'delete',
        params: { id }  // 通过查询参数传递 ID
    });
}

// 批量删除用户
export function deleteBatch(ids) {
    return request({
        url: '/user/delete/batch',
        method: 'delete',
        data: { ids }  // 通过请求体传递 ID 数组
    });
}

// 更新用户信息
export function updateUser(data) {
    return request({
        url: '/user/update',
        method: 'put',
        data
    });
}

// 查询用户信息
export function selectById(id) {
    return request({
        url: '/user/selectById',
        method: 'get',
        params: { id }  // 通过查询参数传递 ID
    });
}

// 查询所有用户
export function selectAll() {
    return request({
        url: '/user/selectAll',
        method: 'get'
    });
}

// 分页查询用户
export function selectPage(params) {
    return request({
        url: '/user/selectPage',
        method: 'get',
        params
    });
}