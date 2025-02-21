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
              class="avatar-uploader"
              action="http://192.168.43.63:8080/api/file/upload"
              :headers="{ token }"
              :show-file-list="false"
              :on-success="handleAvatarSuccess">
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
import request from '@/utils/request'

const user = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
const token = localStorage.getItem('token')

const update = async () => {
  try {
    const res = await request.put('/api/user/update', user.value)
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

const handleAvatarSuccess = (response) => {
  console.log('上传响应:', response)
  user.value.avatar = response.data
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