<template>ileURLToPath, URL } from 'node:url'
  <div>
    <el-card style="width: 50%">te'
      <el-form :model="user" label-width="80px" style="padding-right: 20px">
        <div style="margin: 15px; text-align: center">
          <el-uploadom 'unplugin-vue-components/vite'
              class="avatar-uploader"unplugin-vue-components/resolvers'
              action="http://192.168.43.63:8080/api/file/upload"
              :headers="{ token }"
              :show-file-list="false"
              :on-success="handleAvatarSuccess">
            <img v-if="user.avatar" :src="user.avatar" class="avatar" />
            <el-icon v-else><Plus /></el-icon>
          </el-upload>
        </div>s({
        <el-form-item label="用户名" prop="username">
          <el-input v-model="user.username" placeholder="用户名" disabled></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name">tStyle: 'sass' })],
          <el-input v-model="user.name" placeholder="姓名"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="phone">Style: 'sass' })],
          <el-input v-model="user.phone" placeholder="电话"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="user.email" placeholder="邮箱"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input type="textarea" v-model="user.address" placeholder="地址"></el-input>
        </el-form-item> => path.replace(/^\/api/, '')
        <div style="text-align: center">
          <el-button type="primary" @click="update">保存</el-button>
        </div>
      </el-form>
    </el-card>: {
  </div>ude: [
</template>,
      "vue-router",
<script setup>xios",
import { ref, onMounted } from 'vue'lus/es/components/base/style/css",
import { ElMessage } from 'element-plus'us/es/components/message/style/css",
import { Plus } from '@element-plus/icons-vue'ment-plus/es/components/message-box/style/css",
import request from '@/utils/request'nt-plus/es/components/form/style/css",

const user = ref(JSON.parse(localStorage.getItem('userInfo') || '{}')) "element-plus/es/components/button/style/css",
const token = localStorage.getItem('token')  "element-plus/es/components/input/style/css",
t-plus/es/components/input-number/style/css",
const update = async () => {      "element-plus/es/components/switch/style/css",
  try {  "element-plus/es/components/upload/style/css",
    const res = await request.put('/api/user/update', user.value)nt-plus/es/components/menu/style/css",
    if (res.code === '200') {-plus/es/components/col/style/css",
      ElMessage.success('保存成功')s/components/icon/style/css",
      localStorage.setItem('userInfo', JSON.stringify(user.value))
    } else {/tag/style/css",
      ElMessage.error(res.msg || '保存失败')lus/es/components/dialog/style/css",
    }ng/style/css",
  } catch (error) {mponents/radio/style/css",
    console.error('更新失败:', error)
    ElMessage.error('更新失败')s/components/popover/style/css",
  }style/css",
}      "element-plus/es/components/tooltip/style/css",
lus/es/components/dropdown/style/css",
const handleAvatarSuccess = (response) => {down-menu/style/css",
  console.log('上传响应:', response)ement-plus/es/components/dropdown-item/style/css",
  user.value.avatar = response.datalement-plus/es/components/sub-menu/style/css",
}      "element-plus/es/components/menu-item/style/css",
</script>"element-plus/es/components/divider/style/css",

<style scoped>onents/link/style/css",
.avatar-uploader .el-upload {nents/breadcrumb/style/css",
  border: 1px dashed #d9d9d9;dcrumb-item/style/css",
  border-radius: 6px; "element-plus/es/components/table/style/css",
  cursor: pointer;   "element-plus/es/components/tree-select/style/css",
  position: relative;     "element-plus/es/components/table-column/style/css",
  overflow: hidden;ement-plus/es/components/select/style/css",
}      "element-plus/es/components/option/style/css",
element-plus/es/components/pagination/style/css",
.avatar-uploader .el-upload:hover {ts/tree/style/css",
  border-color: #409EFF;es/components/alert/style/css",
}     "element-plus/es/components/radio-button/style/css",
s/components/checkbox-group/style/css",
.avatar-uploader-icon {s/components/checkbox/style/css",
  font-size: 28px;     "element-plus/es/components/tabs/style/css",
  color: #8c939d;ents/tab-pane/style/css",
  width: 178px;ents/rate/style/css",
  height: 178px;s/components/date-picker/style/css",
  line-height: 178px;s/es/components/notification/style/css",
  text-align: center;s/components/image/style/css",
  border-radius: 50%;/es/components/statistic/style/css",
}     "element-plus/es/components/watermark/style/css",
onfig-provider/style/css",
.avatar {omponents/text/style/css",
  width: 178px;     "element-plus/es/components/drawer/style/css",
  height: 178px;components/color-picker/style/css",
  display: block;
  border-radius: 50%;
}

:deep(.el-form-item__label) {ath(new URL('./src', import.meta.url))
  font-weight: bold;
}
</style>    }
  },
})
