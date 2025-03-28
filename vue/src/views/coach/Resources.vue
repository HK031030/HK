<template>
  <div class="resources-container">
    <!-- 搜索和筛选区域 -->
    <div class="search-area">
      <el-form :inline="true" :model="searchForm">
        <el-form-item>
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索资源"
            prefix-icon="Search"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.type" placeholder="资源类型" clearable>
            <el-option
              v-for="item in resourceTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button type="success" @click="handleAdd">添加资源</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 资源列表展示区域 -->
    <div class="resources-grid">
      <el-card 
        v-for="item in filteredResources" 
        :key="item.id"
        class="resource-card"
        :body-style="{ padding: '0px' }"
      >
        <div class="resource-preview">
          <el-image 
            :src="item.thumbnail" 
            fit="cover"
            :preview-src-list="[item.url]"
          >
            <template #error>
              <div class="image-placeholder">
                <el-icon><Document /></el-icon>
              </div>
            </template>
          </el-image>
        </div>
        <div class="resource-info">
          <h3>{{ item.title }}</h3>
          <p class="resource-desc">{{ item.description }}</p>
          <div class="resource-meta">
            <el-tag size="small">{{ item.type }}</el-tag>
            <span>{{ formatDate(item.createTime) }}</span>
          </div>
        </div>
        <div class="resource-actions">
          <el-button-group>
            <el-button 
              type="primary" 
              link
              @click="handleView(item)"
            >
              查看
            </el-button>
            <el-button 
              type="warning" 
              link
              @click="handleEdit(item)"
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              link
              @click="handleDelete(item)"
            >
              删除
            </el-button>
          </el-button-group>
        </div>
      </el-card>
    </div>

    <!-- 资源编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentResource.id ? '编辑资源' : '添加资源'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="currentResource"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="currentResource.title" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="currentResource.type" style="width: 100%">
            <el-option
              v-for="item in resourceTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="currentResource.description"
            type="textarea"
            rows="3"
          />
        </el-form-item>
        <el-form-item label="资源链接" prop="url">
          <el-input v-model="currentResource.url" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox,ElImageViewer} from 'element-plus'
import dayjs from 'dayjs'

// 资源类型定义
const resourceTypes = [
  { label: '视频', value: 'VIDEO' },
  { label: '文档', value: 'DOCUMENT' },
  { label: '图片', value: 'IMAGE' }
]

// 搜索表单
const searchForm = ref({
  keyword: '',
  type: ''
})
const handleView = (item) => {
  if (!item.url) {
    ElMessage.warning('资源链接不存在')
    return
  }

  // 根据资源类型处理查看逻辑
  switch (item.type) {
    case 'VIDEO':
      // 视频资源：在新窗口打开链接
      window.open(item.url, '_blank')
      break
    case 'DOCUMENT':
      // 文档资源：在新窗口打开链接
      window.open(item.url, '_blank')
      break
    case 'IMAGE':
      // 图片资源：使用 Element Plus 的图片预览
      const imgUrl = item.url
      const imgList = [imgUrl]
      ElImageViewer.open(imgList, 0)
      break
    default:
      // 其他类型：默认在新窗口打开
      window.open(item.url, '_blank')
  }
}
// 模拟资源数据
const resources = ref([
  {
    id: 1,
    title: '科目一考试要点',
    type: 'VIDEO',
    description: '详细讲解科目一考试重点内容',
    url: 'https://www.bilibili.com/video/BV14J4m13769/',
    thumbnail: '/src/assets/imgs/course1.jpg',
    createTime: '2025-03-28'
  },
  {
    id: 2,
    title: '科目二考试要点',
    type: 'DOCUMENT',
    description: '科目二考试重点内容及注意事项',
    url: 'https://blog.csdn.net/sinat_35907936/article/details/107874815',
    thumbnail: '/src/assets/imgs/course2.jpg',
    createTime: '2025-03-29'
  },
  {
    id: 3,
    title: '科目三考试要点',
    type: 'IMAGE',
    description: '科目三考试重点内容及注意事项',
    url: 'https://www.bilibili.com/opus/913593003350687751',
    thumbnail: '/src/assets/imgs/course3.jpg',
    createTime: '2025-03-30'
  }
  // ... 更多资源数据
])

// 筛选后的资源列表
const filteredResources = computed(() => {
  return resources.value.filter(item => {
    const matchKeyword = !searchForm.value.keyword ||
      item.title.toLowerCase().includes(searchForm.value.keyword.toLowerCase()) ||
      item.description.toLowerCase().includes(searchForm.value.keyword.toLowerCase())
    
    const matchType = !searchForm.value.type || 
      item.type === searchForm.value.type
    
    return matchKeyword && matchType
  })
})

// 当前编辑的资源
const currentResource = ref({})
const dialogVisible = ref(false)

// 表单校验规则
const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  url: [{ required: true, message: '请输入资源链接', trigger: 'blur' }]
}

// 搜索处理
const handleSearch = () => {
  // 已通过计算属性实现
}

// 添加资源
const handleAdd = () => {
  currentResource.value = {
    id: '',
    title: '',
    type: '',
    description: '',
    url: '',
    createTime: dayjs().format('YYYY-MM-DD')
  }
  dialogVisible.value = true
}

// 编辑资源
const handleEdit = (item) => {
  currentResource.value = { ...item }
  dialogVisible.value = true
}

// 删除资源
const handleDelete = async (item) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个资源吗？此操作不可恢复',
      '警告',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )
    
    const index = resources.value.findIndex(r => r.id === item.id)
    if (index !== -1) {
      resources.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消删除
  }
}

// 提交表单
const handleSubmit = async () => {
  const formRef = ref(null)
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    if (currentResource.value.id) {
      // 编辑现有资源
      const index = resources.value.findIndex(r => r.id === currentResource.value.id)
      if (index !== -1) {
        resources.value[index] = { ...currentResource.value }
      }
    } else {
      // 添加新资源
      const newResource = {
        ...currentResource.value,
        id: Date.now(),
        createTime: dayjs().format('YYYY-MM-DD')
      }
      resources.value.push(newResource)
    }
    
    dialogVisible.value = false
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}
</script>

<style lang="scss" scoped>
.resources-container {
  padding: 20px;
  
  .search-area {
    margin-bottom: 20px;
  }
  
  .resources-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    
    .resource-card {
      .resource-preview {
        height: 200px;
        overflow: hidden;
        
        .el-image {
          width: 100%;
          height: 100%;
          
          .image-placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            background: #f5f7fa;
            
            .el-icon {
              font-size: 40px;
              color: #909399;
            }
          }
        }
      }
      
      .resource-info {
        padding: 14px;
        
        h3 {
          margin: 0 0 10px;
          font-size: 16px;
        }
        
        .resource-desc {
          color: #666;
          margin: 0 0 10px;
          font-size: 14px;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }
        
        .resource-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #999;
        }
      }
      
      .resource-actions {
        padding: 10px 14px;
        border-top: 1px solid #eee;
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}

@media (max-width: 768px) {
  .resources-container {
    .resources-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>