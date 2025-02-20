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
        {
          path: 'home',
          name: 'ManagerHome',
          component: () => import('@/views/manager/Home.vue'),
          meta: { name: '系统首页' }
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
    { path: '/:pathMatch(.*)', redirect: '/404' }
  ]
})

// 修改路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  
  // 打印调试信息
  console.log('路由守卫 - 目标路径:', to.path)
  console.log('路由守卫 - token:', token)
  console.log('路由守卫 - userInfo:', userInfo)

  if (to.path === '/login' && token) {
    // 已登录用户访问登录页，重定向到首页
    next('/manager/home')
  } else if (to.path !== '/login' && to.path !== '/register' && !token) {
    // 未登录用户访问需要认证的页面，重定向到登录页
    next('/login')
  } else {
    next()
  }
})

export default router
