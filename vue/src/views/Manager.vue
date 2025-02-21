<template>
  <div class="manager-container">
    <div class="manager-header">
      <div class="manager-header-left">
        <img src="../assets/imgs/logo.png" alt="">
        <div class="title">后台管理系统</div>
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
            <img style="width: 40px; height: 40px; border-radius: 50%;" src="../assets/imgs/avatar.png" alt="">
            <span style="margin-left: 5px; color: white">管理员</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile" >个人资料</el-dropdown-item>
              <el-dropdown-item command="password" >修改密码</el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <!-- 下面部分开始 -->

    <div style="display: flex">
      <div class="manager-main-left">
        <el-menu :default-active="router.currentRoute.value.path"
                 :default-openeds="['1', '2']"
                 router
        >
          <el-menu-item index="/manager/home">
            <el-icon><HomeFilled /></el-icon>
            <span>系统首页</span>
          </el-menu-item>
          <el-sub-menu index="1">
            <template #title>
              <el-icon><Menu /></el-icon>
              <span>信息管理</span>
            </template>
            <el-menu-item index="/notice">新闻信息</el-menu-item>
            <el-menu-item index="/notice">系统公告</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="2">
            <template #title>
              <el-icon><Menu /></el-icon>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/user">用户信息</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
      <div class="manager-main-right">
        <RouterView @update:user="updateUser" />
      </div>
    </div>
    <!-- 下面部分结束 -->


  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm(
        '确认退出系统吗?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      
      // 清除所有本地存储
      localStorage.clear()
      
      // 使用 await 确保跳转完成
      await router.push('/login')
      ElMessage.success('退出成功')
    } catch (error) {
      // 用户取消操作，不做处理
      console.log('用户取消退出:', error)
    }
  } else if (command === 'profile') {
    router.push('/manager/person')
  } else if (command === 'password') {
    router.push('/manager/password')
  }
}

const updateUser = (user) => {
  // 获取子组件传递过来的数据，更新当前页面的数据
  localStorage.setItem('userInfo', JSON.stringify(user))
}

</script>

<style scoped>
@import "@/assets/css/manager.css";
</style>

