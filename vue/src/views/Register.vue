<template>
  <div class="register">
    <div class="register-form">
      <h3 class="title">驾校管理系统-注册</h3>
      <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent>
        <div class="form-item">
          <el-input
            v-model="form.username"
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
            v-model="form.password"
            type="password"
            placeholder="密码"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="form-item">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="确认密码"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </div>
        <el-button type="primary" style="width:100%;" @click="handleRegister" :loading="loading">
          注册
        </el-button>
        <div class="register-link">
          <span>已有账号？</span>
          <router-link to="/login">立即登录</router-link>
        </div>
      </el-form>
    </div>
    <div class="el-login-footer">
      <span>Copyright © 2025 驾校管理系统</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const formRef = ref()

const form = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleRegister = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // TODO: 调用注册 API
        // const res = await register({ 
        //   username: form.username, 
        //   password: form.password 
        // })
        
        // 模拟注册成功
        setTimeout(() => {
          ElMessage.success('注册成功，请登录')
          router.push('/login')
        }, 1000)
      } catch (error) {
        console.error('注册失败:', error)
        ElMessage.error('注册失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url("../assets/imgs/loginbackground.jpg");
  background-size: cover;
  position: relative;
//   &::before {
//     content: '';
//     position: absolute;
//     top: 0;
//     left: 0;
//     right: 0;
//     bottom: 0;
//     background: rgba(0, 0, 0, 0.3);
//   }
}

.register-form {
  position: relative;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  width: 400px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  .form-item {
    margin-bottom: 25px;
  }
  
  .el-input {
    height: 40px;
    input {
      height: 40px;
      background: rgba(255, 255, 255, 0.7);
    }
  }
}

.title {
  margin: 0px auto 35px auto;
  text-align: center;
  font-size: 24px;
  color: #2c3e50;
  font-weight: 600;
}

.register-link {
  margin-top: 25px;
  text-align: center;
  span {
    color: #606266;
    font-size: 15px;
  }
  a {
    color: #409EFF;
    text-decoration: none;
    margin-left: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
    
    &:hover {
      color: #66b1ff;
      text-decoration: underline;
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
</style>