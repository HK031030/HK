import request from '@/utils/request'

// 获取日志列表
export function getLogList(params) {
  return request({
    url: '/logs/selectByPage',
    method: 'get',
    params
  })
}

// 导出日志
export function exportLogs(params) {
  return request({
    url: '/logs/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 清空日志
export function clearLogs() {
  return request({
    url: '/logs/clear',
    method: 'delete'
  })
}