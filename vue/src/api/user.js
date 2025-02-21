import request from '@/utils/request'

// 模拟登录接口
export function login(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: '200',
        msg: '登录成功',
        data: {
          token: 'dev-token',
          username: data.username,
          role: 'ADMIN',
          name: '管理员'
        }
      })
    }, 500) // 模拟网络延迟
  })
}

// 注册方法
export function register(data) {
    return request({
        url: '/register',  // 根据后端API路径调整
        method: 'post',
        data
    })
}

// 验证身份并重置密码API
export function verifyAndResetPassword(data) {
  return request({
    url: '/forgetPassword',  // 根据后端API路径调整
    method: 'post',
    data: {
      phone: data.phone,
      email: data.email,
      role: data.role
    }
  })
}