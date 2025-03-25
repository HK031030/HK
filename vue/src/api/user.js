import request from '@/utils/request'

export function login(data) {
    return request({
        url: '/login',
        method: 'post',
        data
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

// 用户相关接口
export const getUserInfo = () => {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

// 更新用户信息
export function updateUserInfo(data) {
  return request({
    url: '/user/update',
    method: 'post',
    data
  })
}


// 文件上传
export function uploadFile(data) {
  const formData = new FormData()
  formData.append('file', data)

  return request({
    url: '/api/file/upload',
    method: 'post',
    data : formData
  })
}

// 获取文件访问路径
export function getFileUrl(filename) {
  return `${import.meta.env.VITE_API_URL}/file/download/${filename}`
}

// 新增：更新密码接口
export function updatePassword(data) {
  return request({
    url: '/updatePassword',
    method: 'post',
    data: data
  });
}

// 创建 user store
const useUserStore = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  
  return {
    userId: userInfo.id,
    username: userInfo.username,
    role: userInfo.role
  }
}

// 添加默认导出
export default useUserStore