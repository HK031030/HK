import request from '@/utils/request';

// 分页查询公告
export function getNoticeList(params) {
  return request({
    url: '/notice/selectByPage',
    method: 'get',
    params
  });
}

// 新增公告
export function addNotice(data) {
  return request({
    url: '/notice/add',
    method: 'post',
    data
  });
}

// 更新公告
export function updateNotice(data) {
  return request({
    url: '/notice/update',
    method: 'post',
    data
  });
}

export function updateTopStatus(id, top) {
  return request({
    url: '/notice/top',
    method: 'put',
    data: { id, top }
  })
}
// 删除公告
export function deleteNotice(id) {
  return request({
    url: `/notice/delete/${id}`,
    method: 'delete'
  });
}

// 批量删除公告
export function batchDeleteNotice(ids) {
  return request({
    url: '/notice/delete/batch',
    method: 'delete',
    params: { ids }
  });
}

// 更新公开状态
export function updateStatus(id, open) {
  return request({
    url: '/notice/update',
    method: 'post',
    data: { id, open }
  });
}