import request from '@/utils/request'

// 获取课程列表（分页）
export function getCourseList(params) {
  return request({
    url: '/course/page',
    method: 'get',
    params
  })
}

// 新增课程
export function addCourse(data) {
  return request({
    url: '/course',
    method: 'post',
    data
  })
}

// 更新课程信息
export function updateCourse(data) {
  return request({
    url: '/course',
    method: 'put',
    data
  })
}

// 删除课程
export function deleteCourse(id) {
  return request({
    url: `/course/${id}`,
    method: 'delete'
  })
}

// 获取课程详情
export function getCourseDetail(id) {
  return request({
    url: `/course/${id}`,
    method: 'get'
  })
}

// 更新课程状态
export function updateCourseStatus(id, status) {
  return request({
    url: `/course/${id}/status`,
    method: 'put',
    data: { status }
  })
}