<template>
  <div class="password-container">
    <el-card class="password-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">{{ isForget ? '重置密码' : '修改密码' }}</span>
        </div>
      </template>
      
      <el-form 
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="password-form">
        <template v-if="isForget">
          <el-form-item label="用户名" prop="username">
            <el-input 
              v-model="form.username" 
              placeholder="请输入用户名">
            </el-input>
          </el-form-item>
          
          <el-form-item label="手机号" prop="phone">
            <el-input 
              v-model="form.phone" 
              placeholder="请输入手机号">
            </el-input>
          </el-form-item>
        </template>
        
        <el-form-item v-else label="原密码" prop="oldPassword">
          <el-input 
            v-model="form.oldPassword" 
            type="password" 
            show-password
            :prefix-icon="Lock">
          </el-input>
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="form.newPassword" 
            type="password" 
            show-password
            :prefix-icon="Key">
          </el-input>
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="form.confirmPassword" 
            type="password" 
            show-password
            :prefix-icon="Check">
          </el-input>
        </el-form-item>

        <div class="form-footer">
          <el-button @click="resetForm" :icon="Refresh">重置</el-button>
          <el-button type="primary" @click="submitForm" :icon="Edit">确认修改</el-button>
          <el-button v-if="isForget" @click="backToLogin">返回登录</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, Key, Check, Refresh, Edit } from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()
const route = useRoute()
const formRef = ref()

const isForget = computed(() => route.query.type === 'forget')

const form = reactive({
  username: '',
  phone: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  oldPassword: [
    { required: !isForget.value, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isForget.value) {
          ElMessage.success('密码重置成功，请重新登录')
          router.push('/login')
        } else {
          const res = await request.post('/api/user/updatePassword', {
            oldPassword: form.oldPassword,
            newPassword: form.newPassword
          })
          if (res.code === '200') {
            ElMessage.success('密码修改成功')
            resetForm()
            localStorage.removeItem('token')
            localStorage.removeItem('userInfo')
            router.push('/login')
          } else {
            ElMessage.error(res.msg || '修改失败')
          }
        }
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败，请稍后重试')
      }
    }
  })
}

const resetForm = () => {
  formRef.value?.resetFields()
}

const backToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.password-container {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.password-card {
  width: 600px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.password-form {
  padding: 30px 20px;
}

.form-footer {
  text-align: center;
  margin-top: 40px;
}

:deep(.el-input__inner) {
  padding-left: 45px;
}

:deep(.el-form-item__label) {
  font-weight: bold;
  color: #606266;
}

:deep(.el-button) {
  padding: 12px 30px;
  margin: 0 10px;
  font-weight: bold;
}

:deep(.el-form-item) {
  margin-bottom: 25px;
}

:deep(.el-input__prefix) {
  font-size: 18px;
  left: 10px;
}
</style>