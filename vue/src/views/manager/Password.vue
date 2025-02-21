<template>
  <div class="password-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>{{ isForget ? '重置密码' : '修改密码' }}</span>
        </div>
      </template>
      
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <!-- 忘记密码时显示用户名和手机号验证 -->
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
        
        <!-- 从系统内修改密码时显示原密码 -->
        <el-form-item v-else label="原密码" prop="oldPassword">
          <el-input 
            v-model="form.oldPassword" 
            type="password" 
            show-password
            placeholder="请输入原密码">
          </el-input>
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="form.newPassword" 
            type="password" 
            show-password
            placeholder="请输入新密码">
          </el-input>
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="form.confirmPassword" 
            type="password" 
            show-password
            placeholder="请再次输入新密码">
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm">确认修改</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button v-if="isForget" @click="backToLogin">返回登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const formRef = ref()

// 判断是否是忘记密码
const isForget = computed(() => route.query.type === 'forget')

const form = reactive({
  username: '',
  phone: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 根据不同模式设置验证规则
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
        // 根据不同模式调用不同的API
        if (isForget.value) {
          // 调用忘记密码的API
          // await resetPassword(form)
          ElMessage.success('密码重置成功，请重新登录')
          router.push('/login')
        } else {
          // 调用修改密码的API
          // await changePassword(form)
          ElMessage.success('密码修改成功，请重新登录')
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          router.push('/login')
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
}

.box-card {
  max-width: 600px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>