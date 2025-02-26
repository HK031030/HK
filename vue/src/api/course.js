import request from '@/utils/request'

// 获取课程列表（分页查询）
export function getCourseList(params) {
  console.log('getCourseList 请求参数:', params)
  
  return request({
    url: '/course/selectPage',
    method: 'get',
    params
  }).then(res => {
    // 打印原始响应
    console.log('getCourseList 原始响应:', res)
    return res
  })
}

// 添加课程
export function addCourse(data) {
  return request({
    url: '/course/add',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  })
}

// 更新课程
export function updateCourse(data) {
  return request({
    url: '/course/update',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  })
}

// 删除课程
export function deleteCourse(id) {
  return request({
    url: `/course/delete/${id}`,
    method: 'delete'
  })
}

// 获取课程详情
export function getCourseDetail(id) {
  return request({
    url: '/course/selectById',    // 匹配后端查询详情接口
    method: 'get',
    params: { id }                // 使用 params 传递 id
  })
}

// 批量删除
export function deleteBatch(ids) {
  return request({
    url: '/course/delete/batch',  // 匹配后端批量删除接口
    method: 'delete',
    params: { ids }              // 使用 params 传递 ids 数组
  })
}

