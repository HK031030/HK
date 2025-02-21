import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: () => import('@/views/Login.vue') },
    { path: '/register', component: () => import('@/views/Register.vue') },
    {
      path: '/manager',
      component: () => import('@/views/Manager.vue'),
      children: [
        { path: 'home', meta: { name: '系统首页' }, component: () => import('@/views/manager/Home.vue') },
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
        }
      ]
    },
    {
      path: '/front',
      component: () => import('@/views/Front.vue'),
      children: [
        { path: 'home', component: () => import('@/views/front/Home.vue'),  }
      ]
    },
    { path: '/404', component: () => import('@/views/404.vue') },
    { path: '/forgot-password', component: () => import('@/views/ForgotPassword.vue') },
    { path: '/:pathMatch(.*)', redirect: '/404' }
  ]
})

// 修改路由守卫
router.beforeEach((to, from, next) => {
  // 开发模式：模拟已登录状态
  const isDev = true // 设置为 true 开启开发模式
  
  if (isDev) {
    // 模拟用户信息
    if (!localStorage.getItem('token')) {
      localStorage.setItem('token', 'dev-token')
      localStorage.setItem('userInfo', JSON.stringify({
        username: 'admin',
        role: 'ADMIN',
        name: '管理员'
      }))
    }
  }

  const token = localStorage.getItem('token')
  const publicPages = ['/login', '/register', '/forgot-password']

  // 根路径处理
  if (to.path === '/') {
    next('/manager/home')
    return
  }

  // 其他页面直接放行
  next()
})

export default router
