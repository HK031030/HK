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
            <el-option value="COACH" label="教练" :selected="true"></el-option>
          </el-select>
        </div>

        <!-- 验证码组件 -->
        <div class="form-item">
          <captcha-component ref="captchaRef"/>
        </div>

        <el-button type="primary" style="width:100%;" @click="handleLogin" :loading="loading">
          登录
        </el-button>
        <!-- 添加注册链接 -->
        <div class="register-link" style="display: flex">
          <div style="flex: 1">还没有账号？请 
            <span style="color: #0f9876; cursor: pointer" @click="$router.push('/register')">注册</span>
          </div>
          <div style="flex: 1; text-align: right">
            <span 
              style="color: #0f9876; cursor: pointer" 
              @click="handleForgetPass"
            >忘记密码</span>
          </div>
        </div>
      </form>
    </div>
    <div class="el-login-footer">
      <span>Copyright © 2025 驾校管理系统</span>
    </div>

    <el-dialog title="忘记密码" v-model="forgetPassDialogVis">
      <el-form :model="forgetUserForm" label-width="80px" style="padding-right: 20px">
        <el-form-item label="用户名">
          <el-input v-model="forgetUserForm.username" autocomplete="off" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="forgetUserForm.phone" autocomplete="off" placeholder="请输入手机号"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="forgetPassDialogVis = false">取 消</el-button>
        <el-button type="primary" @click="resetPassword">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, toRefs } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
// import { User, Lock } from '@element-plus/icons-vue'
import { login } from '@/api/user'
import CaptchaComponent from './Captcha.vue' // 引入验证码组件

const router = useRouter()
const username = ref('')
const password = ref('')
const role = ref('USER') // 默认角色为
const loading = ref(false)
const forgetPassDialogVis = ref(false)
const forgetUserForm = {}

// 访问验证码组件的方法
const captchaRef = ref(null)

const handleLogin = async () => {
  try {
    if (!username.value || !password.value) {
      ElMessage.error('用户名和密码不能为空')
      return
    }

    // 验证验证码
    if (!captchaRef.value) {
      ElMessage.error('验证码组件加载失败')
      return
    }

    const captchaText = captchaRef.value.captcha// 注意这里要访问 .value
    const userInput = captchaRef.value.userInput // 注意这里要访问 .value

    if (!userInput) {
      ElMessage.error('请输入验证码')
      return
    }

    if (userInput.toLowerCase() !== captchaText.toLowerCase()) {
      ElMessage.error('验证码错误，请重试')
      captchaRef.value.generateCaptcha()
      return
    }

    loading.value = true
    const res = await login({
      username: username.value,
      password: password.value,
      role: role.value // 添加角色到登录请求中
    })

    console.log('登录响应:', res)

    if (res.code === '200') {
      // 存储用户信息
      localStorage.setItem('userInfo', JSON.stringify(res.data))
      // 如果后端没有返回token，使用用户名作为临时token
      const token = res.data.token || res.data.username
      if (!token) {
        ElMessage.error('未获取到有效的 token')
        return
      }
      localStorage.setItem('token', token)

      console.log('存储的用户信息:', localStorage.getItem('userInfo'))
      console.log('存储的token:', localStorage.getItem('token'))

      ElMessage.success(res.msg || '登录成功')
      
      // 使用 await 和 try-catch 包裹路由跳转
      try {
        await router.push({
          path: '/manager/home',
          replace: true
        })
      } catch (routerError) {
        console.error('路由跳转失败:', routerError)
      }
    } else {
      ElMessage.error(res.msg || '登录失败')
      captchaRef.value?.generateCaptcha()
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请稍后重试')
    captchaRef.value?.generateCaptcha()
  } finally {
    loading.value = false
  }
}

const handleForgetPass = () => {
  router.push('/forgot-password')
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
.register-link {
  margin-top: 20px;
  
  span {
    &:hover {
      color: #0f9876;
      text-decoration: underline;
    }
  }
}
</style>