export const login = async (data) => {
  // 模拟后端验证
  if (data.username === 'admin' && data.password === '123456' && data.role === 'ADMIN') {
    return {
      status: 200,
      data: {
        token: 'admin-token',
        userInfo: {
          username: data.username,
          role: 'ADMIN',
          avatar: 'https://avatars.githubusercontent.com/u/1?v=4'
        }
      },
      message: '登录成功'
    }
  } else {
    return {
      status: 401,
      message: '用户名或密码错误'
    }
  }
}