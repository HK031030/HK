import axios from "axios";
import { ElMessage } from "element-plus";

// 是否启用模拟数据
const MOCK_ENABLED = true;

const request = axios.create({
    baseURL: 'http://localhost:9090',
    timeout: 30000
});

// 模拟数据
const mockData = {
    '/api/auth/login': (config) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const { username, password, role } = JSON.parse(config.data);
                // 模拟的用户数据
                const users = {
                    admin: {
                        username: 'admin',
                        password: '123456',
                        role: 'ADMIN',
                        token: 'admin-token',
                        userInfo: {
                            name: '管理员',
                            avatar: '../assets/imgs/avatar.png',
                            role: 'ADMIN'
                        }
                    },
                    user: {
                        username: 'user',
                        password: '123456',
                        role: 'USER',
                        token: 'user-token',
                        userInfo: {
                            name: '普通用户',
                            avatar: '../assets/imgs/avatar.png',
                            role: 'USER'
                        }
                    }
                };

                const user = users[username];
                if (user && user.password === password && user.role === role) {
                    resolve({
                        code: 200,
                        message: '登录成功',
                        data: {
                            token: user.token,
                            userInfo: user.userInfo
                        }
                    });
                } else {
                    resolve({
                        code: 401,
                        message: '用户名或密码错误'
                    });
                }
            }, 1000);
        });
    }
};

// request 拦截器
request.interceptors.request.use(config => {
    config.headers['Content-Type'] = 'application/json;charset=utf-8';
    
    // 如果存在token，添加到请求头
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
}, error => {
    return Promise.reject(error);
});

// response 拦截器
request.interceptors.response.use(
    response => {
        // 检查是否有对应的模拟数据
        if (MOCK_ENABLED && mockData[response.config.url]) {
            return mockData[response.config.url](response.config);
        }

        let res = response.data;
        if (response.config.responseType === 'blob') {
            return res;
        }
        if (typeof res === 'string') {
            res = res ? JSON.parse(res) : res;
        }
        return res;
    },
    error => {
        // 模拟数据处理
        if (MOCK_ENABLED && error.config && mockData[error.config.url]) {
            return mockData[error.config.url](error.config);
        }

        if (error.response) {
            switch (error.response.status) {
                case 401:
                    ElMessage.error('未授权，请重新登录');
                    // 可以在这里处理登出逻辑
                    localStorage.removeItem('token');
                    break;
                case 403:
                    ElMessage.error('拒绝访问');
                    break;
                case 404:
                    ElMessage.error('请求错误，未找到该资源');
                    break;
                case 500:
                    ElMessage.error('服务器错误');
                    break;
                default:
                    ElMessage.error(error.response.data.message || '未知错误');
            }
        } else {
            ElMessage.error('网络错误，请稍后重试');
        }
        return Promise.reject(error);
    }
);

export default request;
