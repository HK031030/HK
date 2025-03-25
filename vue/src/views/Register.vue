<template>
  <div class="register">
    <div class="register-form">
      <h3 class="title">驾校管理系统-注册</h3>
      <div class="required-tip">带 <span class="required-star">*</span> 的字段为必填项</div>
      <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent label-position="top">
        <div class="form-item">
          <el-form-item label="用户名" prop="username">
            <span class="required-star">*</span>
            <div class="input-tip">3-20个字符，支持字母、数字、下划线</div>
            <el-input
              v-model="form.username"
              type="text"
              placeholder="请输入用户名"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </div>
        
        <div class="form-item">
          <el-form-item label="密码" prop="password">
            <span class="required-star">*</span>
            <div class="input-tip">6-20个字符，必须包含字母和数字</div>
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
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
        <div class="form-item">
  <el-form-item label="手机号码" prop="phone">
    <span class="required-star">*</span>
    <div class="input-tip">请输入11位手机号码</div>
    <el-input
      v-model="form.phone"
      type="text"
      placeholder="请输入手机号码"
      maxlength="11"
    >
      <template #prefix>
        <el-icon><Phone /></el-icon>
      </template>
    </el-input>
  </el-form-item>
</div>
        <!-- 修改邮箱表单项 -->
<div class="form-item">
  <el-form-item label="邮箱" prop="email">
    <span class="required-star">*</span>
    <div class="input-tip">请输入有效的邮箱地址</div>
    <el-input
      v-model="form.email"
      type="email"
      placeholder="请输入邮箱"
    >
      <template #prefix>
        <el-icon><Message /></el-icon>
      </template>
    </el-input>
  </el-form-item>
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
      <span>启航驾校</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Phone, Message } from '@element-plus/icons-vue'
import { register } from '@/api/user'


const router = useRouter()
const loading = ref(false)
const formRef = ref()

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  email: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
    { 
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/,
      message: '密码必须包含字母和数字',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'))
        } else if (value !== form.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change']
    }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { 
      pattern: /^1[3-9]\d{9}$/, 
      message: '请输入正确的手机号码格式', 
      trigger: ['blur', 'change'] 
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const handleRegister = async () => {
    if (!formRef.value) return;

    try {
        const valid = await formRef.value.validate();
        if (!valid) {
            ElMessage.error('请正确填写所有必填项');
            return;
        }

        loading.value = true;
        const registerData = {
            username: form.username,
            password: form.password,
            phone: form.phone,
            email: form.email,
            role: 'USER'
        };
        console.log('注册请求数据:', registerData);

        const res = await register(registerData);
        console.log('注册响应:', res);

        if (res.code === "200") {
            if (res.data?.token) {
                localStorage.setItem('token', res.data.token);
                console.log('注册存储的 token:', res.data.token);
            }
            ElMessage.success(res.msg || '注册成功，请登录');
            router.push('/login');
        } else {
            ElMessage.error(res.msg || '注册失败');
        }
    } catch (error) {
        console.error('注册失败:', error.response?.data || error);
        ElMessage.error('注册失败，请稍后重试');
    } finally {
        loading.value = false;
    }
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

.required-tip {
  margin-bottom: 20px;
  color: #606266;
  font-size: 14px;
  text-align: left;
}

.required-star {
  color: #f56c6c;
  margin: 0 4px;
}

.input-tip {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.el-form-item {
  margin-bottom: 22px;
  
  &__label {
    font-size: 14px;
    color: #606266;
    margin-bottom: 8px;
  }
}

.register-form {
  .form-item {
    position: relative;
    
    .el-form-item__error {
      padding-top: 4px;
      font-size: 12px;
    }
  }
}
</style>