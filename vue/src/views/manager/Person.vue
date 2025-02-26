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
              :action="uploadConfig.action"
              :headers="uploadConfig.headers"
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
          <el-input type="textarea" v-model="user.address" rows="3"></el-input>
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

const user = ref({
  ...JSON.parse(localStorage.getItem('userInfo') || '{}'),
  avatar: localStorage.getItem('userInfo') ? 
    JSON.parse(localStorage.getItem('userInfo')).avatar : ''
})

// 修改上传配置
const uploadConfig = {
  action: `/api/file/upload`,  // 修改上传地址
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
}

const uploading = ref(false)

// 修改更新方法
const update = async () => {
  try {
    const res = await updateUserInfo(user.value)
    if (res.code === '200') {
      ElMessage.success('保存成功')
      localStorage.setItem('userInfo', JSON.stringify(user.value))
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    console.error('更新失败:', error)
    ElMessage.error('更新失败')
  }
}

const handleAvatarSuccess = async (response) => {
  uploading.value = false
  console.log('上传成功:', response)
  if (response.code === '200') {
    // 将 localhost 替换为实际的后端地址
    const fileUrl = response.data.replace(
      'http://192.168.43.63:8080',
      import.meta.env.VITE_BASE_URL
    )
    user.value.avatar = fileUrl
    ElMessage.success('头像上传成功')
    
    try {
      // 更新用户信息
      const updateRes = await updateUserInfo({
        ...user.value,
        avatar: fileUrl
      })
      if (updateRes.code === '200') {
        localStorage.setItem('userInfo', JSON.stringify({
          ...user.value,
          avatar: fileUrl
        }))
      }
    } catch (error) {
      console.error('更新用户信息失败:', error)
    }
  } else {
    ElMessage.error(response.msg || '上传失败')
  }
}

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
  padding: 20px;
  display: flex;
  justify-content: center;
}

.person-card {
  width: 800px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.avatar-container {
  text-align: center;
  margin-bottom: 30px;
}

.avatar-uploader {
  margin: 0 auto;
}

.avatar-uploader .el-upload {
  border: 2px dashed #409EFF;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  width: 178px;
  height: 178px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
  box-shadow: 0 0 10px rgba(64,158,255,0.3);
}

.avatar {
  width: 178px;
  height: 178px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-icon {
  font-size: 28px;
  color: #8c939d;
}

.upload-tip {
  margin-top: 10px;
  color: #909399;
  font-size: 14px;
}

.person-form {
  padding: 20px;
}

.form-footer {
  text-align: center;
  margin-top: 30px;
}

:deep(.el-form-item__label) {
  font-weight: bold;
  color: #606266;
}

:deep(.el-input__inner) {
  border-radius: 4px;
}

:deep(.el-textarea__inner) {
  border-radius: 4px;
}

:deep(.el-button) {
  padding: 12px 30px;
  font-weight: bold;
}
</style>