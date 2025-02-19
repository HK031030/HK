<template>
  <div class="login">
    <div class="login-form">
      <h3 class="title">驾校管理系统</h3>
      <form @submit.prevent="handleLogin">
        <div class="form-item">
          <el-input
              v-model="username"
              type="text"
              placeholder="用户名"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="form-item">
          <el-input
              v-model="password"
              type="password"
              placeholder="密码"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </div>
        <!-- 角色选择部分 -->
        <div class="form-item">
          <el-select v-model="role" placeholder="选择角色" style="width: 100%">
            <el-option value="USER" label="用户"></el-option>
            <el-option value="ADMIN" label="管理员" :selected="true"></el-option>
          </el-select>
        </div>

        <!-- 验证码组件 -->
        <captcha-component
          @update:captcha="handleCaptchaUpdate"
          @update:userInput="handleUserInputUpdate"
        />

        <el-button type="primary" style="width:100%;" @click="handleLogin" :loading="loading">
          登录
        </el-button>
        <!-- 添加注册链接 -->
        <div class="register-link">
          <span>还没有账号？</span>
          <router-link to="/register">立即注册</router-link>
        </div>
      </form>
    </div>
    <div class="el-login-footer">
      <span>Copyright © 2025 驾校管理系统</span>
    </div>
  </div>
</template>

<script setup>
import { ref, toRefs } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { login } from '@/api/user'
import CaptchaComponent from './Captcha.vue' // 引入验证码组件

const router = useRouter()
const username = ref('')
const password = ref('')
const role = ref('ADMIN') // 默认角色为管理员
const loading = ref(false)

// 访问验证码组件的方法
const captchaRef = ref(null)

const captchaText = ref('') // 存储验证码
const captchaInput = ref('') // 存储用户输入

// 处理验证码更新
const handleCaptchaUpdate = (newCaptcha) => {
  captchaText.value = newCaptcha
  console.log('新的验证码：', newCaptcha)
}

// 处理用户输入更新
const handleUserInputUpdate = (newInput) => {
  captchaInput.value = newInput
}

const handleLogin = async () => {
  if (!username.value || !password.value) {
    ElMessage.error('用户名和密码不能为空')
    return
  }

  // 验证验证码
  if (captchaInput.value.toLowerCase() !== captchaText.value.toLowerCase()) {
    ElMessage.error('验证码错误，请重试')
    return
  }

  loading.value = true
  try {
    const res = await login({
      username: username.value,
      password: password.value,
      role: role.value
    })

    // 检查响应数据的结构
    if (res && res.data && res.data.token) {
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo))
      ElMessage.success('登录成功')
      router.push('/manager/home')
    } else {
      ElMessage.error(res.message || '登录失败')
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url("../assets/imgs/loginbackground.jpg");
  background-size: cover;
}

.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-form {
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.7);
  width: 400px;
  padding: 25px 25px 5px 25px;

  .form-item {
    margin-bottom: 20px;
  }

  .el-input {
    height: 38px;
    input {
      height: 38px;
    }
  }
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}

.register-link {
  margin-top: 20px;
  text-align: right;

  span {
    color: #606266;
    font-size: 14px;
  }

  a {
    color: #409EFF;
    text-decoration: none;
    margin-left: 5px;

    &:hover {
      color: #79bbff;
    }
  }
}
</style>