<template>
  <div class="manager-container">
    <div class="manager-header">
      <div class="manager-header-left">
        <img src="../assets/imgs/logo1.png" alt="">
        <div class="title">驾校预约系统</div>
      </div>
      <div class="manager-header-center">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/manager/home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ router.currentRoute.value.meta.name }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="manager-header-right">
        <el-dropdown style="cursor: pointer" @command="handleCommand">
          <div style="padding-right: 20px; display: flex; align-items: center">
            <img 
              :src="userInfo.avatar || '../assets/imgs/avatar.png'" 
              style="width: 40px; height: 40px; border-radius: 50%;" 
              alt=""
            >
            <span style="margin-left: 5px; color: white">{{ userInfo.username || '管理员' }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人资料</el-dropdown-item>
              <el-dropdown-item command="password">修改密码</el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div style="display: flex">
      <div class="manager-main-left">
        <el-menu 
          :default-active="router.currentRoute.value.path"
          :default-openeds="defaultOpeneds"
          router
          @select="handleMenuSelect"
        >
          <!-- 系统首页 -->
          <el-menu-item v-if="hasPermission('system-home')" index="/manager/home">
            <el-icon><HomeFilled /></el-icon>
            <span>系统首页</span>
          </el-menu-item>

          <!-- 信息管理 -->
          <el-sub-menu v-if="hasPermission('info-manage')" index="1">
            <template #title>
              <el-icon><Menu /></el-icon>
              <span>信息管理</span>
            </template>
            <el-menu-item v-if="hasPermission('news')" index="/manager/news">新闻信息</el-menu-item>
            <el-menu-item v-if="hasPermission('notice')" index="/manager/notice">系统公告</el-menu-item>
          </el-sub-menu>

          <!-- 用户管理 -->
          <el-sub-menu v-if="hasPermission('user-manage')" index="2">
            <template #title>
              <el-icon><Menu /></el-icon>
              <span>用户管理</span>
            </template>
            <el-menu-item v-if="hasPermission('user-info')" index="/manager/user">用户信息</el-menu-item>
          </el-sub-menu>

          <!-- 课程管理 -->
          <el-sub-menu v-if="hasPermission('course-manage')" index="3">
            <template #title>
              <el-icon><Reading /></el-icon>
              <span>课程管理</span>
            </template>
            <el-menu-item v-if="hasPermission('course-info')" index="/manager/course">
              <el-icon><Document /></el-icon>
              <span>课程信息</span>
              <span v-if="hasPermission('course-info-edit')" ></span>
            </el-menu-item>
            <el-menu-item v-if="hasPermission('course-appointment')" index="/manager/course-appointment">
              <el-icon><Calendar /></el-icon>
              <span>预约审核</span>
              <span v-if="hasPermission('course-appointment-audit')" ></span>
            </el-menu-item>
            <el-menu-item v-if="hasPermission('course-booking')" index="/manager/course-booking">
              <el-icon><Calendar /></el-icon>
              <span>课程预约</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>

      <div class="manager-main-right">
        <RouterView @update:user="updateUser" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Menu, HomeFilled, Reading, Document, Calendar } from '@element-plus/icons-vue';

const router = useRouter();
const defaultOpeneds = ref(['1', '2', '3']);  // 默认展开的菜单项

// 获取用户信息
const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'));
const role = ref(userInfo.value.role || '');  // 当前角色

// 权限配置
const permissions = {
  'ADMIN': [
    'system-home',
    'info-manage', 
    'news', 'news-add', 'news-edit', 'news-delete', // 新闻完全权限
    'notice', 'notice-add', 'notice-edit', 'notice-delete', // 公告完全权限
    'user-manage', 'user-info',
    'course-manage',           // 访问课程管理模块
    'course-info',            // 查看课程信息
    'course-info-edit',       // 编辑课程信息（增删改）
    'course-appointment',     // 查看预约记录
    'course-appointment-audit', // 审核和取消预约
    'course-booking'
  ],
  'COACH': [
    'system-home',
    'info-manage', 
    'news', 
    'notice', 'notice-add', 'notice-edit', // 查看、添加、编辑公告，无删除
    'user-manage', 'user-info',
    'course-manage',           // 访问课程管理模块
    'course-info',            // 查看自己负责的课程信息
    'course-info-edit',       // 编辑自己负责的课程（可选）
    'course-appointment',     // 查看自己课程的预约
    'course-appointment-audit', // 审核自己课程的预约
    'course-booking'
  ],
  'USER': [
    'system-home',
    'info-manage', 'news', 'notice',
    'course-manage', 
    'course-reserve',          // 访问课程管理模块
    'course-info',             // 查看所有课程信息（只读）
    'course-booking'
  ]
};

// 权限检查函数
const hasPermission = (permission) => {
  console.log('用户角色:', role.value);  // 输出当前角色
  console.log('当前权限列表:', permissions[role.value]);
  console.log('正在检查权限:', permission);
  return permissions[role.value]?.includes(permission) || false;
};

// 菜单选择事件
const handleMenuSelect = (index) => {
  console.log('Menu selected:', index);
};

// 下拉菜单命令处理
const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm(
        '确认退出系统吗?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );
      localStorage.clear();
      await router.push('/front/home');
      ElMessage.success('退出成功');
    } catch (error) {
      console.log('用户取消退出:', error);
    }
  } else if (command === 'profile') {
    router.push('/manager/person');
  } else if (command === 'password') {
    router.push('/manager/password');
  }
};

// 更新用户信息
const updateUser = (user) => {
  localStorage.setItem('userInfo', JSON.stringify(user));
  userInfo.value = user;
  role.value = user.role || '';
};

// 调试日志
onMounted(() => {
  console.log('权限配置:', permissions);
  console.log('Current role:', role.value);
  console.log('Current route:', router.currentRoute.value.path);
  
});
</script>

<style scoped>
@import "@/assets/css/manager.css";
</style>

