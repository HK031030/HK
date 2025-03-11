import request from '@/utils/request'

// 获取课程列表（分页查询）
export function getCourseList(params) {
  console.log('getCourseList 请求参数:', params)

  return request({
    url: '/course/selectPage',
    method: 'get',
    params
  })
}

// 新增：搜索课程
export function searchCourses(params) {
  console.log('searchCourses 请求参数:', params)
  return request({
    url: '/course/search', 
    method: 'get',
    params
  })
}
// 添加课程
export function addCourse(data) {
  return request({
    url: '/course/add',
    method: 'post',
     data
  })
}

// 更新课程
export function updateCourse(data) {
  return request({
    url: '/course/update',
    method: 'post',
     data
  })
}

// 删除课程
export function deleteCourse(id) {
  return request({
    url: `/course/delete/${id}`,
    method: 'delete'
  })
}

// // 获取课程详情
// export function getCourseDetail(id) {
//   return request({
//     url: '/course/selectById',    // 匹配后端查询详情接口
//     method: 'get',
//     params: { id }                // 使用 params 传递 id
//   })
// }

// 批量删除
export function deleteBatch(ids) {
  return request({
    url: '/course/delete/batch',  // 匹配后端批量删除接口
    method: 'delete',
    params: { ids }              // 使用 params 传递 ids 数组
  })
}

// 获取课程时段
export function getCourseSlots(courseId) {
  return request({
    url: `/course/${courseId}/slots`,
    method: 'get'
  })
}

// 创建预约
export function createReservation(data) {
  return request({
    url: '/reservations',
    method: 'post',
    data
  })
}