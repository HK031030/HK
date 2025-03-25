import axios from "axios";
import { ElMessage } from "element-plus";
import router from "@/router";

const request = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,  // 修改为你的后端服务地址
    timeout: 30000
});

//请求拦截器
request.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['token'] = token 
        }else {
            console.warn('Token 未找到，请检查登录状态');
          }
        // 如果是 POST 请求，默认使用 JSON 格式
        if (config.method === 'post' && !config.headers['Content-Type']) {
          config.headers['Content-Type'] = 'application/json';
      }
        // 打印请求配置
        console.log('请求配置:', {
            url: config.url,
            method: config.method,
            params: config.params,
            data: config.data,
            headers: config.headers
        })

        return config
    },
    error => {
        console.error('请求错误:', error)
        return Promise.reject(error)
    }
)
// request.interceptors.request.use(config => {
//     config.headers['Content-Type'] = 'application/json;charset=utf-8';
//     let user = JSON.parse(localStorage.getItem("honey-user") || '{}')
//     config.headers['token'] = user.token  // 设置请求头

//     return config
// }, error => {
//     console.error('request error: ' + error) // for debug
//     return Promise.reject(error)
// });


request.interceptors.response.use(
  response => response.data,
  error => {
    console.error('响应错误:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
    });
    if (error.response?.status === 401) {
        ElMessage.error('登录已过期，请重新登录');
        localStorage.removeItem('token');
        router.push('/login');
    }
    return Promise.reject(error);
}
)

export default request
