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
      redirect: '/home',  //重新定向到主页
      children: [
        { path: 'home', meta: { name: '系统首页' }, component: () => import('@/views/manager/Home.vue'),  },
        { path: 'person', meta: { name: '个人信息' }, component: () => import('@/views/manager/Person.vue'),  },
        { path: 'user', meta: { name: '用户信息' }, component: () => import('@/views/manager/User.vue'),  },
        { path: 'password', meta: { name: '修改密码' }, component: () => import('@/views/manager/Password.vue'),  },
        { path: 'news', meta: { name: '新闻信息' }, component: () => import('@/views/manager/News.vue'),  },
        { path: 'notice', meta: { name: '系统公告' }, component: () => import('@/views/manager/Notice.vue'),  }
      ]
    },
    { path: '/404', component: () => import('@/views/404.vue') },
    { path: '/:pathMatch(.*)', redirect: '/404' }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  // 修改判断条件，允许访问登录和注册页面
  if (to.path === '/login' || to.path === '/register') {
    next()
  } else {
    if (!token) {
      next('/login')
    } else {
      next()
    }
  }
})

export default router
