// 模拟用户数据
const mockUsers = [
    {
      username: 'admin',
      password: '123456',
      role: 'ADMIN',
      id: 1,
      name: '管理员',
      avatar: '',
      token: 'admin-token',
      phone: '13800138000'
    },
    {
      username: 'coach',
      password: '123456',
      role: 'COACH',
      id: 2,
      name: '教练',
      avatar: '',
      token: 'coach-token',
      phone: '13800138001'
    },
    {
      username: 'user',
      password: '123456',
      role: 'USER',
      id: 3,
      name: '学员',
      avatar: '',
      token: 'user-token',
      phone: '13800138002'
    }
  ]
  // 默认导出
export default {
    mockUsers
  }