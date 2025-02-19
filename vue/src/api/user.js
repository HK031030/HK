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