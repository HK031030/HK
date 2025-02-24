import { format } from 'date-fns'

const mockNotices = [
  {
    id: 1,
    title: '2024年春季学期驾校报名通知',
    content: '欢迎报名2024年春季驾校课程，即日起开始接受报名...',
    user: '管理员',
    time: '2024-02-22 10:00:00',
    open: true
  },
  {
    id: 2,
    title: '关于新增模拟考试系统的通知',
    content: '为提高学员练习效率，新增智能模拟考试系统...',
    user: '系统管理员',
    time: '2024-02-21 14:30:00',
    open: true
  },
  {
    id: 3,
    title: '驾校教练员招聘公告',
    content: '因业务发展需要，现招聘专职教练员若干名...',
    user: '人事专员',
    time: '2024-02-20 09:15:00',
    open: false
  }
]

export const mockNoticeApi = {
  getNoticeList(params) {
    const { pageNum, pageSize, title } = params
    let result = [...mockNotices]
    
    if (title) {
      result = result.filter(item => item.title.includes(title))
    }
    
    const total = result.length
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    
    return {
      code: '200',
      msg: '获取成功',
      data: {
        records: result.slice(start, end),
        total,
        pageNum,
        pageSize
      }
    }
  },

  addNotice(data) {
    const notice = {
      ...data,
      id: mockNotices.length + 1,
      user: '管理员',
      time: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      open: true
    }
    mockNotices.unshift(notice)
    return {
      code: '200',
      msg: '添加成功',
      data: notice
    }
  },

  updateNotice(data) {
    const index = mockNotices.findIndex(item => item.id === data.id)
    if (index !== -1) {
      mockNotices[index] = {
        ...mockNotices[index],
        ...data,
        time: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
      }
    }
    return {
      code: '200',
      msg: '更新成功',
      data: mockNotices[index]
    }
  },

  deleteNotice(id) {
    const index = mockNotices.findIndex(item => item.id === id)
    if (index !== -1) {
      mockNotices.splice(index, 1)
    }
    return {
      code: '200',
      msg: '删除成功'
    }
  },

  batchDeleteNotice(ids) {
    ids.forEach(id => {
      const index = mockNotices.findIndex(item => item.id === id)
      if (index !== -1) {
        mockNotices.splice(index, 1)
      }
    })
    return {
      code: '200',
      msg: '批量删除成功'
    }
  },

  updateStatus(id, status) {
    const notice = mockNotices.find(item => item.id === id)
    if (notice) {
      notice.open = status
    }
    return {
      code: '200',
      msg: '状态更新成功'
    }
  }
}