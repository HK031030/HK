<template>
  <div class="course-container">

    <el-tabs v-model="activeTab">
      <el-tab-pane label="课程管理" name="courses">
        <!-- 课程管理内容 -->
      </el-tab-pane>
      <el-tab-pane label="我的预约" name="reservations" v-if="role === 'USER'">
        <ReservationList :userId="userInfo.id" />
      </el-tab-pane>
      <el-tab-pane label="课程预约" name="reservations" v-if="role === 'COACH' || role === 'ADMIN'">
        <ReservationList :coachId="role === 'COACH' ? userInfo.id : null" />
      </el-tab-pane>
    </el-tabs>
  
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input v-model="searchForm.title" placeholder="课程名称" style="width: 200px" clearable />
      <el-select v-model="searchForm.type" placeholder="课程类型" clearable>
        <el-option label="科目一" value="科目一" />
        <el-option label="科目二" value="科目二" />
        <el-option label="科目三" value="科目三" />
        <el-option label="科目四" value="科目四" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
      <el-button
        v-if="hasPermission('course-info-edit')"
        type="success"
        :icon="Plus"
        @click="handleAdd"
      >
        新增课程
      </el-button>
    </div>

    <!-- 课程表格 -->
    <el-table :data="courses" v-loading="loading" border stripe>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="title" label="课程名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="description" label="课程介绍" min-width="170" show-overflow-tooltip />
      <el-table-column prop="type" label="课程类型" width="100" />
      <el-table-column prop="during" label="课程时长" width="80">
        <template #default="{ row }">
          {{ row.during }}课时
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="课程开始时间" width="170" />
      <el-table-column prop="endTime" label="课程结束时间" width="170" />
      <el-table-column prop="coachName" label="教练" width="70" />
      <el-table-column prop="remain" label="剩余名额" width="100" align="center" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            :icon="Edit"
            circle
            @click="handleEdit(row)"
            v-if="canEditCourse(row)"
          />
          <el-button
            type="danger"
            :icon="Delete"
            circle
            @click="handleDelete(row)"
            v-if="role === 'ADMIN' || role === 'COACH'"
          />
          <el-button
            v-if="role === 'USER' && hasPermission('course-reserve')"
            type="warning"
            :icon="Calendar"
            circle
            @click="handleReserve(row)"
            :disabled="row.remain === 0"
          />
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
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑课程' : '新增课程'" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="课程名称" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="课程介绍" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="课程类型" prop="type">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="科目一" value="科目一" />
            <el-option label="科目二" value="科目二" />
            <el-option label="科目三" value="科目三" />
            <el-option label="科目四" value="科目四" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程时长" prop="during">
          <el-input v-model="form.during" disabled />
        </el-form-item>
        <el-form-item label="课程开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="updateEndTime"
          />
        </el-form-item>
        <el-form-item label="课程结束时间" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm:ss"
            disabled
          />
        </el-form-item>
        <el-form-item label="教练" prop="coachId">
          <el-select v-model="form.coachId" style="width: 100%" placeholder="请选择教练" :disabled="role === 'COACH'">
            <el-option
              v-for="coach in coachList"
              :key="coach.id"
              :label="coach.name"
              :value="coach.id"
            />
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

    <!-- 预约对话框 -->
    <el-dialog v-model="reserveDialogVisible" title="课程预约" width="500px" destroy-on-close>
      <el-form :model="reserveForm" :rules="reserveRules" ref="reserveFormRef" label-width="80px">
        <el-form-item label="课程名称">
          <el-text>{{ currentCourse.title }}</el-text>
        </el-form-item>
        <el-form-item label="预约时段" prop="slotId">
          <el-text v-if="timeSlots.length > 0">
            {{ `${timeSlots[0].startTime} - ${timeSlots[0].endTime} (剩余: ${timeSlots[0].remain})` }}
          </el-text>
          <el-text v-else>加载中...</el-text>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="reserveForm.comment"
            type="textarea"
            :rows="3"
            placeholder="请输入备注（如特殊需求）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reserveDialogVisible = false">取消</el-button>
        <el-button type="warning" @click="handleReserveSubmit" :loading="reserveSubmitting">
          立即预约
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete, Calendar } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { getCourseList, searchCourses,addCourse, updateCourse, deleteCourse, getCourseSlots, createReservation } from '@/api/course'
import ReservationList from './ReservationList.vue';

const courses = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(5)
const total = ref(0)
const coachList = ref([])

const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
const role = ref(userInfo.value.role || '')

const activeTab = ref('courses');
const hasPermission = (permission) => {
  const permissions = {
    'ADMIN': ['course-info', 'course-info-edit'],
    'COACH': ['course-info', 'course-info-edit'],
    'USER': ['course-info', 'course-reserve']
  }
  return permissions[role.value]?.includes(permission) || false
}

const canEditCourse = (row) => {
  if (role.value === 'ADMIN') return true
  if (role.value === 'COACH') return row.coachId === userInfo.value.id
  return false
}

const formatTime = (time) => {
  const date = new Date(time)
  const pad = (num) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const loadCoaches = async () => {
  try {
    const res = await request.get('/coach/selectAll')
    if (res.code === '200') {
      coachList.value = res.data || []
    } else {
      ElMessage.error('加载教练列表失败')
    }
  } catch (error) {
    console.error('加载教练失败:', error)
    ElMessage.error('加载教练失败')
  }
}

const loadCourses = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: page.value,
      pageSize: pageSize.value,
      title: searchForm.title, // 修改为 title
      type: searchForm.type
    }
    if (role.value === 'COACH') {
      params.coachId = userInfo.value.id
    }
    const res = await getCourseList(params)
    if (res.code === '200') {
      courses.value = (res.data.records || []).map(record => ({
        id: record.id,
        title: record.title,
        description: record.description, // 修改为 description
        type: record.type || '未知',
        during: record.during || 30,
        startTime: record.startTime,
        endTime: record.endTime,
        createtime: record.createtime, // 修改为 createtime
        coachId: record.coachId, // 修改为 coachId
        coachName: record.coachName,
        remain: record.remain || 30
      }))
      total.value = res.data.total || 0
      if (courses.value.length === 0) {
        ElMessage.info('当前没有课程数据')
      }
    } else {
      ElMessage.error(res.msg || '加载课程列表失败')
    }
  } catch (error) {
    console.error('加载课程失败:', error)
    ElMessage.error('加载课程列表失败')
  } finally {
    loading.value = false
  }
}

// 新增：搜索课程
const handleSearch = async () => {
  loading.value = true
  try {
    const params = {
      title: searchForm.title,
      type: searchForm.type
    }
    if (role.value === 'COACH') {
      params.coachId = userInfo.value.id
    }
    const res = await searchCourses(params)
    console.log('Search response:', res)
    if (res.code === '200') {
      courses.value = (res.data || []).map(record => ({
        id: record.id,
        title: record.title,
        description: record.description,
        type: record.type || '未知',
        during: record.during || 30,
        startTime: record.startTime,
        endTime: record.endTime,
        createtime: record.createtime,
        coachId: record.coachId,
        coachName: record.coachName,
        remain: record.remain || 30
      }))
      total.value = res.data.length || 0
      if (courses.value.length === 0) {
        ElMessage.info('未找到匹配的课程')
      }
    } else {
      ElMessage.error(res.msg || '搜索课程失败')
    }
  } catch (error) {
    console.error('搜索课程失败:', error)
    ElMessage.error('搜索课程失败')
  } finally {
    loading.value = false
  }
}
const searchForm = reactive({
  title: '', // 修改为 title
  type: ''
})

const dialogVisible = ref(false)
const formRef = ref(null)
const submitting = ref(false)

const form = reactive({
  id: '',
  title: '', // 修改为 title
  description: '', // 修改为 description
  type: '',
  during: 30,
  startTime: '',
  endTime: '',
  createtime: '', // 修改为 createtime
  coachId: null, // 修改为 coachId
  remain: 30
})

const rules = {
  title: [{ required: true, message: '请输入课程名称', trigger: 'blur' }], // 修改为 title
  description: [{ required: true, message: '请输入课程介绍', trigger: 'blur' }], // 修改为 description
  type: [{ required: true, message: '请选择课程类型', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择课程开始时间', trigger: 'change' }],
  coachId: [{ required: true, message: '请选择教练', trigger: 'change' }] // 修改为 coachId
}

const updateEndTime = (startTime) => {
  if (startTime) {
    const start = new Date(startTime)
    const end = new Date(start)
    end.setDate(start.getDate() + 5)
    form.endTime = formatTime(end)
  } else {
    form.endTime = ''
  }
}

const handleAdd = () => {
  Object.assign(form, {
    id: '',
    title: '', // 修改为 title
    description: '', // 修改为 description
    type: '',
    during: 30,
    startTime: '',
    endTime: '',
    createtime: formatTime(new Date()), // 修改为 createtime
    coachId: role.value === 'COACH' ? userInfo.value.id : null, // 修改为 coachId
    remain: 30
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  if (!canEditCourse(row)) {
    ElMessage.warning('您无权编辑此课程')
    return
  }
  Object.assign(form, {
    id: row.id,
    title: row.title, // 修改为 title
    description: row.description, // 修改为 description
    type: row.type,
    during: 30,
    startTime: row.startTime,
    endTime: row.endTime,
    createtime: row.createtime, // 修改为 createtime
    coachId: row.coachId, // 修改为 coachId
    remain: row.remain
  })
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  if (role.value !== 'ADMIN' && role.value !== 'COACH') {
    ElMessage.warning('您无权删除课程')
    return
  }
  try {
    await ElMessageBox.confirm('确认删除该课程吗？', '提示', {
      type: 'warning'
    })
    const res = await deleteCourse(row.id)
    if (res.code === '200') {
      ElMessage.success('删除成功')
      loadCourses()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    submitting.value = true
    if (!form.id) {
      form.createtime = formatTime(new Date()) // 修改为 createtime
    }
    const submitData = {
      id: String(form.id),
      title: form.title, // 修改为 title
      description: form.description, // 修改为 description
      type: form.type ,
      during: 30,
      startTime: form.startTime,
      endTime: form.endTime,
      createtime: form.createtime, // 修改为 createtime
      coachId: parseInt(form.coachId), // 修改为 coachId
      remain: form.remain
    }
    if (form.id) {
      submitData.id = String(form.id) // 编辑时传递 id
    }
    const apiMethod = form.id ? updateCourse : addCourse
    const res = await apiMethod(submitData)
    if (res.code === '200') {
      ElMessage.success(form.id ? '更新成功' : '添加成功')
      if (!form.id && res.data && res.data.id) {
        form.id = res.data.id // 新增时保存返回的 id
      }
      dialogVisible.value = false
      loadCourses()
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const reserveDialogVisible = ref(false)
const reserveSubmitting = ref(false)
const slotLoading = ref(false)
const currentCourse = ref({})
const timeSlots = ref([])

const reserveForm = reactive({
  courseId: '',
  slotId: '',
  comment: ''
})

const reserveRules = {
  slotId: [{ required: true, message: '请选择预约时段', trigger: 'change' }]
}

const reserveFormRef = ref(null);

const handleReserve = async (row) => {
  if (role.value !== 'USER') {
    ElMessage.warning('只有用户可以进行预约操作')
    return
  }
  if (!row || !row.id) {
    ElMessage.error('无效的课程数据');
    return;
  }
  try {
    currentCourse.value = { ...row };
    reserveForm.courseId = row.id;
    reserveForm.slotId = '';
    reserveForm.comment = '';
    slotLoading.value = true;
    const res = await getCourseSlots(row.id);
    console.log('Get course slots response:', res);
    if (res.code === '200') {
      let slotsData;
      if (Array.isArray(res.data)) {
        slotsData = res.data;
      } else if (res.data && typeof res.data === 'object') {
        slotsData = [res.data]; // 转换为单元素数组
      } else {
        slotsData = [];
      }
      timeSlots.value = slotsData.filter(slot => slot !== null && slot !== undefined);
      if (timeSlots.value.length === 0) {
        ElMessage.info('该课程暂无可用时段');
      } else {
        // 自动填充 slotId（假设 id 存在或使用其他唯一标识）
        reserveForm.slotId = timeSlots.value[0].id || timeSlots.value[0].courseId || `${timeSlots.value[0].startTime}-${timeSlots.value[0].endTime}`;
        reserveDialogVisible.value = true;
      }
    } else {
      ElMessage.error(res.msg || '获取时段失败');
    }
  } catch (error) {
    console.error('获取时段失败:', error);
    ElMessage.error('获取时段失败');
  } finally {
    slotLoading.value = false;
  }
}

const handleReserveSubmit = async () => {
  try {
    if (reserveSubmitting.value) return
    reserveSubmitting.value = true
    await reserveFormRef.value.validate()
    const payload = {
      course_id: reserveForm.courseId,
      user_id: userInfo.value.id,
      slot_id: reserveForm.slotId,
      comment: reserveForm.comment, // 添加备注字段
      createdAt: new Date().toISOString()
    }
    const res = await createReservation(payload)
    if (res.code === '201') {
      ElMessage.success('预约成功')
      reserveDialogVisible.value = false
      loadCourses()
    } else {
      ElMessage.error(res.message || '预约失败')
    }
  } catch (error) {
    console.error('预约失败:', error)
    if (error.response?.data?.code === 409) {
      ElMessage.warning('课程已无可用时段')
    } else {
      ElMessage.error('预约失败')
    }
  } finally {
    reserveSubmitting.value = false
  }
}

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
  loadCoaches()
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