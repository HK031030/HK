<template>
  <div class="forgot-password">
    <div class="forgot-password-form">
      <h3 class="title">身份验证</h3>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <!-- 输入手机号验证部分 -->
        <el-form-item label="手机号码" prop="phone">
          <el-input 
            v-model="form.phone" 
            placeholder="请输入注册手机号"
            maxlength="11"
          >
            <template #prefix>
              <el-icon><Phone /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 输入邮箱验证部分 -->
        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="form.email" 
            placeholder="请输入注册邮箱"
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 选择角色部分 -->
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="ADMIN" />
            <el-option label="用户" value="USER" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            style="width: 100%" 
            @click="handleVerify" 
            :loading="loading"
          >
            验证身份
          </el-button>
        </el-form-item>

        <div class="back-login">
          <span @click="router.push('/login')">返回登录</span>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Phone, Message } from '@element-plus/icons-vue'
import { verifyAndResetPassword } from '@/api/user'


const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const formRef = ref()

const form = reactive({
  phone: '',
  email: '',
  role: ''
})

// 验证规则
const rules = {
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 在 Vuex 或 localStorage 中记录验证次数
const checkVerifyLimit = () => {
  const verifyCount = localStorage.getItem('verifyCount') || 0
  const lastVerifyTime = localStorage.getItem('lastVerifyTime') || 0
  
  // 24小时内最多允许5次验证
  if (verifyCount >= 5 && Date.now() - lastVerifyTime < 24 * 60 * 60 * 1000) {
    ElMessage.error('验证次数过多，请24小时后再试')
    return false
  }
  return true
}

// 修改验证逻辑
const handleVerify = async () => {
  try {
    // 表单验证
    await formRef.value.validate()
    
    loading.value = true
    console.log('发送验证请求:', {
      phone: form.phone,
      email: form.email,
      role: form.role
    })

    const res = await verifyAndResetPassword({
      phone: form.phone,
      email: form.email,
      role: form.role
    })

    console.log('接收响应数据:', res)

    // 修改判断逻辑
    if (res.code === '200') {  // 使用字符串比较
      ElMessage({
        type: 'success',
        duration: 5000,
        message: '验证成功，密码已重置为：123456，请登录后及时修改密码'
      })
      router.push('/login')
    } else {
      // 非200状态码都当作失败处理
      ElMessage.error(res.msg || '验证失败')
    }
  } catch (error) {
    console.error('验证失败:', error)
    ElMessage.error(error.message || '验证失败，请检查输入信息是否正确')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.forgot-password {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url("../assets/imgs/loginbackground.jpg");
  background-size: cover;
}

.forgot-password-form {
  width: 500px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}

.back-login {
  text-align: center;
  margin-top: 20px;
  
  span {
    color: #409EFF;
    cursor: pointer;
    &:hover {
      color: #66b1ff;
    }
  }
}
</style>