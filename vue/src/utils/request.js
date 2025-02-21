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

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['token'] = token
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 开发模式：始终返回成功
    return {
      code: '200',
      msg: 'success',
      data: response.data
    }
  },
  error => {
    // 开发模式：打印错误但不中断
    console.error('请求错误:', error)
    return {
      code: '200',
      msg: 'success',
      data: null
    }
  }
)

export default request;
