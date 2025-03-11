<template>
  <div class="person-container">
    <el-card class="person-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">个人资料</span>
        </div>
      </template>
      <el-form :model="user" label-width="80px" class="person-form">
        <div class="avatar-container">
          <el-upload
              v-loading="uploading"
              element-loading-text="上传中..."
              class="avatar-uploader"
              :http-request="uploadFile" 
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :on-error="handleAvatarError"
              :before-upload="beforeAvatarUpload"
              accept="image/*">
            <img v-if="user.avatar" :src="user.avatar" class="avatar" />
            <el-icon v-else class="avatar-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">点击上传头像</div>
        </div>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="user.username" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="user.name"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="电话" prop="phone">
              <el-input v-model="user.phone"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="user.email"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="地址" prop="address">
          <el-input type="textarea" v-model="user.address" :rows="3" />
        </el-form-item>

        <div class="form-footer">
          <el-button type="primary" @click="update" :icon="Check">保存修改</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Check } from '@element-plus/icons-vue'
import { updateUserInfo } from '@/api/user'  // 导入API方法
import request from '@/utils/request';

const user = ref({
  ...JSON.parse(localStorage.getItem('userInfo') || '{}'),
  avatar: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).avatar : ''
});



const uploading = ref(false)

// 自定义上传方法
const uploadFile = async (options) => {
  uploading.value = true;
  try {
    // 将文件转为 Base64
    const file = options.file;
    const base64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

    // 构造 JSON 数据
    const uploadData = {
      id: user.value.id,
      username: user.value.username,
      role: user.value.role,
      name: user.value.name || '',
      phone: user.value.phone || '',
      email: user.value.email || '',
      address: user.value.address || '',
      avatar: base64 // 文件以 Base64 形式发送
    };

    console.log('Sending upload data:', uploadData);
    const token = localStorage.getItem('token');
    const res = await request.post('/file/upload', uploadData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Upload response:', res.data);
    options.onSuccess(res); // 只调用一次 options.onSuccess
  } catch (error) {
    console.error('Upload error:', error);
    options.onError(error);
  } finally {
    uploading.value = false;
  }
};


// 更新用户信息
const update = async () => {
  try {
    console.log('Sending user data for update:', user.value);
    const res = await updateUserInfo(user.value);
    console.log('Update response:', res);

    if (res.code === '200') {
      ElMessage.success('保存成功');
      localStorage.setItem('userInfo', JSON.stringify(user.value));
      // 触发事件通知父组件（如 Manager.vue）
      emit('update:user', user.value);
    } else {
      ElMessage.error(res.msg || '保存失败');
    }
  } catch (error) {
    console.error('更新失败:', error);
    ElMessage.error('更新失败');
  }
};

const handleAvatarSuccess = (response) => {
  uploading.value = false;
  console.log('上传成功:', response);
 
  if (response.code === '200') {
    const fileUrl = response.data.replace('http://192.168.43.63:8080', import.meta.env.VITE_BASE_URL);
    user.value.avatar = fileUrl;    // 更新 avatar
    ElMessage.success('头像上传成功');
    localStorage.setItem('userInfo', JSON.stringify(user.value));
    emit('update:user', user.value);
  } else {
    ElMessage.error(response.msg || '上传失败');
  }
};
// 定义 emit
const emit = defineEmits(['update:user']);

const handleAvatarError = (error) => {
  uploading.value = false
  console.error('上传失败:', error)
  ElMessage.error('头像上传失败，请重试')
}

const beforeAvatarUpload = (file) => {
  uploading.value = true
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  return true
}
</script>

<style scoped>
.person-container {
  padding: 40px;
  display: flex;
  justify-content: center;
  /* 添加背景图片 */
  background: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80') no-repeat center center fixed;
  background-size: cover;
  /* 添加渐变遮罩，使内容更清晰 */
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80') no-repeat center center fixed;
  min-height: 100vh;
}

.person-card {
  width: 900px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95); /* 半透明背景，增加层次感 */
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.15); /* 更强的阴影 */
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2); /* 微妙边框 */
}

.person-card:hover {
  transform: translateY(-8px); /* 悬浮效果更明显 */
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2); /* 悬浮时阴影增强 */
}

.card-header {
  padding: 20px;
  background: linear-gradient(90deg, #409eff, #36cfc9); /* 渐变头部 */
  color: #fff;
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* 添加头部装饰线 */
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
  font-size: 26px; /* 字体稍大 */
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase; /* 大写标题 */
}

.person-form {
  padding: 40px;
  background: linear-gradient(135deg, #f9fbfd 0%, #eef2f7 100%); /* 表单区域渐变背景 */
  border-radius: 0 0 16px 16px;
}

.avatar-container {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

/* 上传头像区域优化 */
.avatar-uploader .el-upload {
  border: 3px dashed #dcdfe6;
  border-radius: 50%;
  width: 200px; /* 稍大一点 */
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
  background: #fff;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
  box-shadow: 0 0 20px rgba(64, 158, 255, 0.4); /* 更强的悬浮效果 */
}

.avatar {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  transition: transform 0.3s ease, opacity 0.3s ease;
  border: 4px solid #fff; /* 添加白色边框 */
}

.avatar:hover {
  transform: scale(1.05); /* 轻微放大 */
  opacity: 0.9;
}

.avatar-icon {
  font-size: 40px;
  color: #909399;
  transition: color 0.3s ease, transform 0.3s ease;
}

.avatar-uploader .el-upload:hover .avatar-icon {
  color: #409eff;
  transform: scale(1.1); /* 图标动画 */
}

.upload-tip {
  margin-top: 12px;
  color: #606266;
  font-size: 14px;
  font-style: italic;
  opacity: 0.8;
}

/* 输入框优化 */
.input-field {
  border-radius: 10px;
  background: #fff;
  transition: all 0.3s ease;
  border: 1px solid #e6e9f0;
}

.input-field:focus-within {
  box-shadow: 0 0 12px rgba(64, 158, 255, 0.3);
  border-color: #409eff;
}

.textarea-field {
  border-radius: 10px;
  background: #fff;
  transition: all 0.3s ease;
  border: 1px solid #e6e9f0;
}

.textarea-field:focus-within {
  box-shadow: 0 0 12px rgba(64, 158, 255, 0.3);
  border-color: #409eff;
}

.form-footer {
  text-align: center;
  margin-top: 40px;
  padding-bottom: 20px;
}

/* 按钮优化 */
.save-button {
  padding: 14px 50px; /* 更大一些 */
  font-size: 16px;
  font-weight: 600;
  border-radius: 25px;
  background: linear-gradient(90deg, #409eff, #67c23a); /* 渐变 */
  border: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.save-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
}

.save-button:hover::after {
  width: 300px;
  height: 300px; /* 点击涟漪效果 */
}

.save-button:hover {
  transform: scale(1.08);
  box-shadow: 0 8px 16px rgba(64, 158, 255, 0.4);
}

/* Element Plus 深度样式 */
:deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
  padding-right: 10px;
}

:deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: none;
  background: #fff;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-textarea__inner) {
  border-radius: 10px;
  box-shadow: none;
  font-family: inherit;
  background: #fff;
  transition: all 0.3s ease;
}

:deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-col) {
  margin-bottom: 24px; /* 间距稍大 */
}

/* 添加装饰性分隔线 */
.person-form::before {
  content: '';
  display: block;
  width: 60px;
  height: 2px;
  background: #409eff;
  margin: 0 auto 30px;
  border-radius: 1px;
}
</style>