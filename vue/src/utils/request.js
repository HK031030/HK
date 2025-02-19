import axios from "axios";
import { ElMessage } from "element-plus";
import router from "@/router";

const request = axios.create({
    baseURL: '/api',  // 修改为你的真实后端地址
    timeout: 30000
});

// 模拟数据
// const mockData = {
//     '/api/auth/login': (config) => {
//         return new Promise((resolve) => {
//             setTimeout(() => {
//                 try {
//                     const { username, password, role } = JSON.parse(config.data);
                    
//                     // 模拟的用户数据，匹配你的JSON格式
//                     const users = {
//                         admin: {
//                             id: 1,
//                             username: 'admin',
//                             password: '123456',
//                             name: '管理员',
//                             avatar: '../assets/imgs/avatar.png',
//                             role: 'ADMIN',
//                             phone: '13888888888',
//                             email: 'admin@example.com'
//                         },
//                         user: {
//                             id: 2,
//                             username: 'user',
//                             password: '123456',
//                             name: '张三',
//                             avatar: '../assets/imgs/avatar.png',
//                             role: 'USER',
//                             phone: '13666666666',
//                             email: 'user@example.com'
//                         }
//                     };

//                     const user = users[username];
//                     if (user && user.password === password && user.role === role) {
//                         resolve({
//                             code: "200",
//                             msg: "请求成功",
//                             data: {
//                                 ...user,
//                                 newPassword: null
//                             }
//                         });
//                     } else {
//                         resolve({
//                             code: "401",
//                             msg: "用户名或密码错误",
//                             data: null
//                         });
//                     }
//                 } catch (error) {
//                     console.error('模拟数据处理错误:', error);
//                     resolve({
//                         code: "500",
//                         msg: "服务器错误",
//                         data: null
//                     });
//                 }
//             }, 500);
//         });
//     }
// };

// request 拦截器
request.interceptors.request.use(config => {
    // 打印请求信息
    if (config.url === '/register') {
        console.log('注册请求配置:', {
            url: config.url,
            method: config.method,
            data: config.data
        })
    }
    
    config.headers['Content-Type'] = 'application/json;charset=utf-8'
    return config
}, error => {
    return Promise.reject(error)
})

// response 拦截器
request.interceptors.response.use(
    response => {
        const res = response.data;
        // 直接返回数据，因为后端已经按照约定格式返回
        return res;
    },
    error => {
        // 模拟数据处理
        // if (MOCK_ENABLED && error.config && mockData[error.config.url]) {
        //     return mockData[error.config.url](error.config);
        // }

        if (error.response) {
            switch (error.response.status) {
                case 401:
                    ElMessage.error('未授权，请重新登录');
                    localStorage.removeItem('token');
                    localStorage.removeItem('userInfo');
                    router.push('/login');
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
                    ElMessage.error(error.response.data?.msg || '未知错误');
            }
        } else {
            ElMessage.error('网络错误，请稍后重试');
        }
        return Promise.reject(error);
    }
);

export default request;
