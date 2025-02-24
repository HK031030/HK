// 模拟数据
const mockCourses = [
  {
    id: 1,
    name: '科目一理论课程',
    type: '科目一',
    price: 1000,
    duration: 48,
    description: '交通法规与安全驾驶理论课程',
    status: '启用'
  },
  {
    id: 2,
    name: '科目二实操培训',
    type: '科目二',
    price: 2000,
    duration: 60,
    description: '场地驾驶技能训练',
    status: '启用'
  }
]

// 模拟接口响应
export const mockCourseApi = {
  getCourseList(params) {
    const { page, pageSize, name, type } = params
    let result = [...mockCourses]
    
    // 搜索过滤
    if (name) {
      result = result.filter(c => c.name.includes(name))
    }
    if (type) {
      result = result.filter(c => c.type === type)
    }
    
    // 分页
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    return {
      code: '200',
      msg: '获取成功',
      data: {
        records: result.slice(start, end),
        total: result.length,
        page,
        pageSize
      }
    }
  },
  
  addCourse(data) {
    const newCourse = {
      ...data,
      id: mockCourses.length + 1
    }
    mockCourses.push(newCourse)
    return {
      code: '200',
      msg: '添加成功',
      data: newCourse
    }
  },
  
  updateCourse(data) {
    const index = mockCourses.findIndex(c => c.id === data.id)
    if (index > -1) {
      mockCourses[index] = data
    }
    return {
      code: '200',
      msg: '更新成功',
      data
    }
  },
  
  deleteCourse(id) {
    const index = mockCourses.findIndex(c => c.id === id)
    if (index > -1) {
      mockCourses.splice(index, 1)
    }
    return {
      code: '200',
      msg: '删除成功'
    }
  }
}