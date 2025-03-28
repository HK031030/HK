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
  margin: 0;
  padding: 0;
  min-height: calc(100vh - 60px);
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url('@/assets/imgs/person.jpg') no-repeat center center;
  background-size: cover;
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
/* 卡片样式 */
.password-card {
  width: 800px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 卡片悬浮效果 */
.password-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
  background: rgba(255, 255, 255, 0.9);
}

/* 卡片标题样式 */
.card-header {
  padding: 20px;
  background: linear-gradient(90deg, 
    rgba(64, 158, 255, 0.9),
    rgba(54, 207, 201, 0.9)
  );
  backdrop-filter: blur(8px);
  color: #fff;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.card-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: #fff;
  border-radius: 2px;
}

.header-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 1.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

/* 表单样式 */
.password-form {
  padding: 40px;
  background: rgba(249, 251, 253, 0.75);
  backdrop-filter: blur(5px);
  border-radius: 0 0 16px 16px;
}

.password-form::before {
  content: '';
  display: block;
  width: 60px;
  height: 2px;
  background: #409eff;
  margin: 0 auto 30px;
  border-radius: 1px;
}

/* 表单底部样式 */
.form-footer {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px dashed rgba(64, 158, 255, 0.2);
}

/* Element Plus 组件深度选择器样式 */
:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(4px);
  border-radius: 10px;
  box-shadow: none;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

:deep(.el-button) {
  height: 40px;
  padding: 0 30px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 25px;
  transition: all 0.3s ease;
}

:deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(64, 158, 255, 0.4);
}

:deep(.el-button + .el-button) {
  margin-left: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 25px;
}

:deep(.el-input__prefix) {
  font-size: 16px;
  left: 12px;
}

:deep(.el-input__prefix-icon) {
  color: #409eff;
  transition: all 0.3s ease;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .password-container {
    padding: 20px;
  }
  
  .password-card {
    width: 100%;
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
  
  .form-footer {
    flex-direction: column;
    gap: 10px;
  }
  
  :deep(.el-button + .el-button) {
    margin-left: 0;
    margin-top: 10px;
  }
}
</style>