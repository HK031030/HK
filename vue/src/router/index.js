import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { 
    path: '/', 
    redirect: '/front/home' // 修改默认重定向到前端首页
  },
  { 
    path: '/login', 
    name: 'Login',
    component: () => import('@/views/Login.vue') 
  },
  { 
    path: '/register', 
    component: () => import('@/views/Register.vue') 
  },
  // 前端展示路由
  { 
    path: '/front/home', 
    name: 'FrontHome',
    component: () => import('@/views/front/Home.vue')
  },
  // 管理系统路由
  {
    path: '/manager',
    component: () => import('@/views/Manager.vue'),
    redirect: '/manager/home',
    meta: { requiresAuth: true }, // 添加需要认证标记
    children: [
      { 
        path: 'home', 
        name: 'ManagerHome',
        meta: { name: '系统首页' },
        component: () => import('@/views/manager/Home.vue') 
      },
      { 
        path: 'person', 
        meta: { name: '个人信息' }, 
        component: () => import('@/views/manager/Person.vue') 
      },
      { 
        path: 'password', 
        meta: { name: '修改密码' }, 
        component: () => import('@/views/manager/Password.vue') 
      },
      {
        path: 'user',meta: { name: '用户管理' },component: () => import('@/views/manager/User.vue')
      },
      { 
        path: 'course', 
        meta: { name: '课程信息' }, 
        component: () => import('@/views/manager/Course.vue') 
      },
      {
        path: 'course-appointment', 
        meta: { name: '课程预约审核' }, 
        component: () => import('@/views/manager/CourseAppointment.vue') 
      },
      { 
        path: 'notice', 
        name: 'Notice',
        meta: { name: '系统公告' },
        component: () => import('@/views/manager/Notice.vue')
      }
    ]
  },
  { path: '/404', component: () => import('@/views/404.vue') },
  { path: '/forgot-password', component: () => import('@/views/ForgotPassword.vue') },
  { path: '/:pathMatch(.*)', redirect: '/404' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 修改路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  // 定义公开页面
  const publicPages = ['/front/home', '/login', '/register', '/forgot-password']
  const authRequired = !publicPages.includes(to.path)

  // 处理需要认证的页面
  if (authRequired) {
    if (!token || !userInfo) {
      // 清除可能存在的无效数据
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      // 保存用户想要访问的页面
      localStorage.setItem('redirectPath', to.fullPath)
      next('/login')
      return
    }

    // 验证 token 是否过期
    try {
      // 可以添加 token 验证逻辑
      const tokenExpired = false // 这里替换为实际的 token 验证
      if (tokenExpired) {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        next('/login')
        return
      }
    } catch (error) {
      console.error('Token validation error:', error)
      next('/login')
      return
    }
  }

  // 处理已登录用户访问登录/注册页面
  if (token && userInfo) {
    if (to.path === '/login' || to.path === '/register') {
      next('/manager/home')
      return
    }
  }

  next()
})

export default router
