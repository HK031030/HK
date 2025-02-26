import axios from "axios";
import { ElMessage } from "element-plus";
import router from "@/router";

const request = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,  // 修改为你的后端服务地址
    timeout: 30000
});

// 请求拦截器
request.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}` // JWT token格式
        }
        // 打印请求配置
        console.log('请求配置:', {
            url: config.url,
            method: config.method,
            params: config.params,
            data: config.data,
            headers: config.headers
        })

        // 如果是 POST 请求，默认使用 JSON 格式
        if (config.method === 'post' && !config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json'
        }

        return config
    },
    error => {
        console.error('请求错误:', error)
        return Promise.reject(error)
    }
)

request.interceptors.request.use(
  config => {
    // 打印请求配置
    console.log('请求配置:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data instanceof URLSearchParams ? 
        Object.fromEntries(config.data.entries()) : config.data
    })
    
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  response => response.data,
  error => {
    // 详细的错误日志
    console.error('响应错误:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    return Promise.reject(error)
  }
)

export default request;
