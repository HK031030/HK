import { format } from 'date-fns'

// 模拟预约数据
const mockAppointments = [
  {
    id: 1,
    username: 'user001',
    courseName: '科目一理论考试培训',
    courseType: '科目一',
    appointmentTime: '2024-02-25 09:00:00',
    status: '待审核',
    remark: '',
    createTime: '2024-02-22 14:30:00'
  },
  {
    id: 2,
    username: 'user002',
    courseName: '科目二场地驾驶',
    courseType: '科目二',
    appointmentTime: '2024-02-26 14:00:00',
    status: '已通过',
    remark: '预约通过，请按时参加',
    createTime: '2024-02-22 15:20:00'
  },
  {
    id: 3,
    username: 'user003',
    courseName: '科目三路考培训',
    courseType: '科目三',
    appointmentTime: '2024-02-27 10:00:00',
    status: '已拒绝',
    remark: '该时段已约满',
    createTime: '2024-02-22 16:45:00'
  }
]

// 模拟预约接口
export const mockAppointmentApi = {
  // 获取预约列表
  getAppointmentList(params) {
    console.log('模拟获取预约列表:', params)
    const { page, pageSize, username, courseType, status, startDate, endDate } = params
    let result = [...mockAppointments]
    
    // 搜索过滤
    if (username) {
      result = result.filter(a => a.username.includes(username))
    }
    if (courseType) {
      result = result.filter(a => a.courseType === courseType)
    }
    if (status) {
      result = result.filter(a => a.status === status)
    }
    if (startDate && endDate) {
      result = result.filter(a => {
        const appointmentDate = new Date(a.appointmentTime).getTime()
        return appointmentDate >= new Date(startDate).getTime() && 
               appointmentDate <= new Date(endDate).getTime()
      })
    }
    
    // 分页处理
    const total = result.length
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    return {
      code: '200',
      msg: '获取成功',
      data: {
        records: result.slice(start, end),
        total,
        page,
        pageSize
      }
    }
  },

  // 审核预约
  auditAppointment(id, data) {
    console.log('模拟审核预约:', { id, data })
    const index = mockAppointments.findIndex(a => a.id === Number(id))
    if (index > -1) {
      mockAppointments[index] = {
        ...mockAppointments[index],
        status: data.status,
        remark: data.remark,
        updateTime: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
      }
    }
    return {
      code: '200',
      msg: '审核成功',
      data: mockAppointments[index]
    }
  },

  // 获取预约详情
  getAppointmentDetail(id) {
    const appointment = mockAppointments.find(a => a.id === id)
    return {
      code: '200',
      msg: '获取成功',
      data: appointment
    }
  },

  // 新增预约记录（用于测试）
  addAppointment(data) {
    const newAppointment = {
      ...data,
      id: mockAppointments.length + 1,
      createTime: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      status: '待审核'
    }
    mockAppointments.push(newAppointment)
    return {
      code: '200',
      msg: '添加成功',
      data: newAppointment
    }
  }
}