<template>
  <div class="course-container">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchForm.name"
        placeholder="课程名称"
        style="width: 200px"
        clearable
      />
      <el-select v-model="searchForm.type" placeholder="课程类型" clearable>
        <el-option label="科目一" value="科目一" />
        <el-option label="科目二" value="科目二" />
        <el-option label="科目三" value="科目三" />
        <el-option label="科目四" value="科目四" />
      </el-select>
      <el-select v-model="searchForm.status" placeholder="课程状态" clearable>
        <el-option label="未开始" value="未开始" />
        <el-option label="进行中" value="进行中" />
        <el-option label="已结束" value="已结束" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="loadCourses">搜索</el-button>
      <el-button type="success" :icon="Plus" @click="handleAdd">新增课程</el-button>
    </div>

    <!-- 课程表格 -->
    <el-table :data="courses" v-loading="loading" border stripe>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="name" label="课程介绍" min-width="200" show-overflow-tooltip />
      <el-table-column prop="type" label="课程类型" width="100" />
      <el-table-column prop="duration" label="课程时长" width="100">
        <template #default="{ row }">
          {{ row.duration }}课时
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="上课时间" width="180" />
      <el-table-column prop="location" label="上课地点" width="150" show-overflow-tooltip />
      <el-table-column prop="coach" label="教练" width="100" />
      <el-table-column prop="maxStudents" label="最大人数" width="100" align="center" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" :icon="Edit" circle @click="handleEdit(row)" />
          <el-button type="danger" :icon="Delete" circle @click="handleDelete(row)" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? '编辑课程' : '新增课程'"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="课程介绍" prop="name">
          <el-input v-model="form.name" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="课程类型" prop="type">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="科目一" value="科目一" />
            <el-option label="科目二" value="科目二" />
            <el-option label="科目三" value="科目三" />
            <el-option label="科目四" value="科目四" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程时长" prop="duration">
          <el-input-number v-model="form.duration" :min="1" />
          <span class="unit">课时</span>
        </el-form-item>
        <el-form-item label="上课时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="上课地点" prop="location">
          <el-input v-model="form.location" />
        </el-form-item>
        <el-form-item label="教练" prop="coach">
          <el-input v-model="form.coach" />
        </el-form-item>
        <el-form-item label="最大人数" prop="maxStudents">
          <el-input-number v-model="form.maxStudents" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="课程状态" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="未开始" value="未开始" />
            <el-option label="进行中" value="进行中" />
            <el-option label="已结束" value="已结束" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as courseApi from '@/api/course'
import { mockCourseApi } from '@/mock/course'

// 根据环境选择 API
const api = process.env.NODE_ENV === 'development' ? mockCourseApi : courseApi

// 数据列表相关
const courses = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  status: ''
})

// 弹窗表单相关
const dialogVisible = ref(false)
const formRef = ref(null)
const submitting = ref(false)
const form = reactive({
  id: '',
  name: '',
  type: '',
  duration: 1,
  startTime: '',
  location: '',
  coach: '',
  maxStudents: 20,
  status: '未开始'
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入课程介绍', trigger: 'blur' }],
  type: [{ required: true, message: '请选择课程类型', trigger: 'change' }],
  duration: [{ required: true, message: '请输入课程时长', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择上课时间', trigger: 'change' }],
  location: [{ required: true, message: '请输入上课地点', trigger: 'blur' }],
  coach: [{ required: true, message: '请输入教练姓名', trigger: 'blur' }],
  maxStudents: [{ required: true, message: '请输入最大人数', trigger: 'blur' }],
  status: [{ required: true, message: '请选择课程状态', trigger: 'change' }]
}

// 获取状态标签类型
const getStatusType = (status) => {
  const map = {
    '未开始': 'info',
    '进行中': 'success',
    '已结束': ''
  }
  return map[status]
}

// 加载课程列表
const loadCourses = async () => {
  loading.value = true
  try {
    const res = await api.getCourseList({
      page: page.value,
      pageSize: pageSize.value,
      ...searchForm
    })
    courses.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('加载课程列表失败')
  } finally {
    loading.value = false
  }
}

// 处理新增
const handleAdd = () => {
  form.id = ''
  form.name = ''
  form.type = ''
  form.duration = 1
  form.startTime = ''
  form.location = ''
  form.coach = ''
  form.maxStudents = 20
  form.status = '未开始'
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  Object.assign(form, row)
  dialogVisible.value = true
}

// 处理删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该课程吗？', '提示', {
      type: 'warning'
    })
    await api.deleteCourse(row.id)
    ElMessage.success('删除成功')
    loadCourses()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    submitting.value = true
    if (form.id) {
      await api.updateCourse(form)
      ElMessage.success('更新成功')
    } else {
      await api.addCourse(form)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadCourses()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  loadCourses()
}

const handleCurrentChange = (val) => {
  page.value = val
  loadCourses()
}

onMounted(() => {
  loadCourses()
})
</script>

<style scoped>
.course-container {
  padding: 20px;
}

.search-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.unit {
  margin-left: 10px;
  color: #606266;
}

:deep(.el-form-item__label) {
  font-weight: bold;
}

:deep(.el-table) {
  margin-top: 20px;
}
</style>