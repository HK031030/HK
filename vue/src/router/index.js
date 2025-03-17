import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

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
        meta: { name: '系统首页' ,roles: ['ADMIN', 'COACH', 'USER']},
        component: () => import('@/views/manager/Home.vue') 
      },
      { 
        path: 'person', 
        meta: { name: '个人信息' ,roles: ['ADMIN', 'COACH', 'USER']}, 
        component: () => import('@/views/manager/Person.vue') 
      },
      { 
        path: 'password', 
        meta: { name: '修改密码' ,roles: ['ADMIN', 'COACH', 'USER'] }, 
        component: () => import('@/views/manager/Password.vue') 
      },
      {
        path: 'user',meta: { name: '用户管理' ,roles: ['ADMIN','COACH']},component: () => import('@/views/manager/User.vue')
      },
      { 
        path: 'course', 
        meta: { name: '课程信息' ,roles: ['ADMIN', 'COACH', 'USER'] }, 
        component: () => import('@/views/manager/Course.vue') 
      },
      {
        path: 'course-appointment', 
        meta: { name: '课程预约审核',roles: ['ADMIN', 'COACH', 'USER'] }, 
        component: () => import('@/views/manager/CourseAppointment.vue') 
      },
      {
        path: 'course-booking',
        meta: { name: '预约课程', roles: ['ADMIN', 'COACH', 'USER'] },
        component: () => import('@/views/manager/ReservationList.vue')
      },
      { 
        path: 'notice', 
        name: 'Notice',
        meta: { name: '系统公告',roles: ['ADMIN', 'COACH', 'USER'] },
        component: () => import('@/views/manager/Notice.vue')
      },
      { 
        path: 'news', 
        name: 'News',
        meta: { name: '新闻信息',roles: ['ADMIN', 'COACH', 'USER'] },
        component: () => import('@/views/manager/News.vue')
      },
      {
        path: '/manager/logs',
        name: 'LogsManagement',
        component: () => import('@/views/manager/LogsManagement.vue'),
        meta: {
          name: '日志管理',
          requiresAuth: true,
          permissions: ['logs-view']
        }
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


//修改路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const role = userInfo.role || ''; // 获取用户角色
  
  // 定义公开页面
  const publicPages = ['/front/home', '/login', '/register', '/forgot-password']
  const authRequired = !publicPages.includes(to.path)

  // 处理需要认证的页面
  if (authRequired && (!token || !userInfo)) {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    localStorage.setItem('redirectPath', to.fullPath);
    next('/login');
    return;
  }

  // 角色权限检查
  if (authRequired && to.meta.roles && !to.meta.roles.includes(role)) {
    ElMessage.error('您无权访问此页面');
    next('/manager/home');  // 权限不足时重定向到首页
    return;
  }

  // 允许所有情况下跳转到公开页面（无需重定向）
  next();
});


export default router
