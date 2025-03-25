<template>
  <div class="password-container">
    <el-card class="password-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">
            <el-icon class="header-icon"><Lock /></el-icon>
            修改密码
          </span>
        </div>
      </template>
      
      <el-form 
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="password-form">
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名"
            :disabled="true">
          </el-input>
        </el-form-item>
        
        <el-form-item label="原密码" prop="oldPassword">
          <el-input 
            v-model="form.oldPassword" 
            type="password" 
            show-password
            :prefix-icon="Lock"
            placeholder="请输入原密码">
          </el-input>
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="form.newPassword" 
            type="password" 
            show-password
            :prefix-icon="Key"
            placeholder="请输入新密码">
          </el-input>
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="form.confirmPassword" 
            type="password" 
            show-password
            :prefix-icon="Check"
            placeholder="请确认新密码">
          </el-input>
        </el-form-item>

        <div class="form-footer">
          <el-button @click="resetForm">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-button type="primary" @click="submitForm">
            <el-icon><Edit /></el-icon>
            确认修改
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Lock, Key, Check, Refresh, Edit } from '@element-plus/icons-vue';
import { updatePassword } from '@/api/user'; // 导入正确的 API

const router = useRouter();
const formRef = ref();

const form = reactive({
  id: '',
  role: '',
  username: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== form.newPassword) {
          callback(new Error('两次输入密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 从本地存储加载用户信息
onMounted(() => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  form.id = userInfo.id || '';         // 获取 id
  form.role = userInfo.role || '';
  form.username = userInfo.username || ''; // 获取 username 用于显示
  if (!form.id) {
    ElMessage.error('用户未登录或用户信息不完整，请先登录');
    router.push('/login');
  }
});

const submitForm = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    const submitData = {
      id: form.id,           // 使用 id 作为标识
      role: form.role,
      username: form.username, // 假设后端接受 username 作为 phone
      password: form.oldPassword,
      newPassword: form.newPassword
    };
    console.log('提交的数据:', submitData); // 调试日志
    const res = await updatePassword(submitData);
    console.log('后端响应:', res); // 调试日志
    if (res.code === '200') {
      ElMessage.success('密码修改成功，请重新登录');
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      router.push('/login');
    } else {
      ElMessage.error(res.msg || '修改失败');
    }
  } catch (error) {
    console.error('操作失败:', error);
    ElMessage.error(error.response?.data?.msg || '操作失败，请稍后重试');
  }
};

const resetForm = () => {
  formRef.value?.resetFields();
};
</script>

<style scoped>
/* 整体容器样式 */
.password-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 卡片样式 */
.password-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 卡片标题样式 */
.card-header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  background-color: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
}

/* 表单样式 */
.password-form {
  padding: 30px;
  max-width: 600px;
  margin: 0 auto;
}

.form-footer {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px dashed #ebeef5;
}

/* Element Plus 组件深度选择器样式 */
:deep(.el-input__inner) {
  height: 40px;
  line-height: 40px;
  padding-left: 45px;
  border-radius: 4px;
}

:deep(.el-form-item__label) {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

:deep(.el-button) {
  height: 40px;
  padding: 0 30px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  transition: all 0.3s;
}

:deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-form-item) {
  margin-bottom: 25px;
}

:deep(.el-input__prefix) {
  font-size: 16px;
  left: 12px;
}

/* 输入框图标样式 */
:deep(.el-input__prefix-icon) {
  color: #909399;
}

/* 按钮组样式 */
:deep(.el-button + .el-button) {
  margin-left: 15px;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .password-container {
    padding: 10px;
  }
  
  .password-card {
    margin: 0 10px;
  }
  
  .password-form {
    padding: 20px;
  }
  
  :deep(.el-form-item__label) {
    float: none;
    display: block;
    text-align: left;
    padding: 0 0 10px;
  }
}
</style>