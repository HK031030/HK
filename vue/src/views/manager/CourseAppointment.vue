<template>
  <div class="appointment-container">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <!-- 管理员可以搜索用户名 -->
      <el-input
        v-if="role === 'ADMIN'"
        v-model="searchForm.username"
        placeholder="用户名"
        style="width: 200px"
        clearable
      />
      <!-- 所有角色都可以按课程类型搜索 -->
      <el-select v-model="searchForm.courseType" placeholder="课程类型" clearable>
        <el-option label="科目一" value="科目一" />
        <el-option label="科目二" value="科目二" />
        <el-option label="科目三" value="科目三" />
        <el-option label="科目四" value="科目四" />
      </el-select>
      <!-- 预约状态 -->
      <el-select v-model="searchForm.status" placeholder="预约状态" clearable>
        <el-option label="已预约" value="RESERVED" />
        <el-option label="已取消" value="CANCELLED" />
      </el-select>
      <el-date-picker
        v-model="searchForm.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
      />
      <el-button type="primary" :icon="Search" @click="loadAppointments">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <!-- 预约表格 -->
    <el-table :data="appointments" v-loading="loading" border stripe>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <!-- 管理员和教练可以看到用户名 -->
      <el-table-column 
        v-if="['ADMIN', 'COACH'].includes(role)"
        prop="username" 
        label="用户名" 
        width="120" 
      />
      <el-table-column prop="courseName" label="课程名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="courseType" label="课程类型" width="100" />
      <el-table-column prop="appointmentTime" label="预约时间" width="180" />
      <!-- 教练名称列 -->
      <el-table-column prop="coachName" label="教练" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'RESERVED' ? 'success' : 'info'">
            {{ row.status === 'RESERVED' ? '已预约' : '已取消' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="预约时间" width="180" />
      
      <!-- 操作列 -->
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <!-- 用户只能取消自己的预约 -->
          <el-button
            v-if="role === 'USER' && row.status === 'RESERVED'"
            type="danger"
            size="small"
            @click="handleCancel(row)"
          >取消预约</el-button>
          <!-- 所有角色都可以查看详情 -->
          <el-button
            type="primary"
            size="small"
            @click="handleDetail(row)"
          >详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="预约详情"
      width="500px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="课程名称">{{ detailForm.courseName }}</el-descriptions-item>
        <el-descriptions-item label="课程类型">{{ detailForm.courseType }}</el-descriptions-item>
        <el-descriptions-item label="预约时间">{{ detailForm.appointmentTime }}</el-descriptions-item>
        <el-descriptions-item label="教练">{{ detailForm.coachName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          {{ detailForm.status === 'RESERVED' ? '已预约' : '已取消' }}
        </el-descriptions-item>
        <el-descriptions-item label="预约时间">{{ detailForm.createTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
// import { getAppointmentList, cancelAppointment } from '@/api/reservations'

// 用户信息和角色
const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
const role = ref(userInfo.value.role || '')

// 列表数据
const appointments = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索表单
const searchForm = reactive({
  username: '',
  courseType: '',
  status: '',
  dateRange: []
})

// 详情数据
const detailVisible = ref(false)
const detailForm = reactive({
  courseName: '',
  courseType: '',
  appointmentTime: '',
  coachName: '',
  status: '',
  createTime: ''
})

// 加载预约列表
const loadAppointments = async () => {
  loading.value = true
  try {
    const [startDate, endDate] = searchForm.dateRange || []
    const params = {
      pageNum: page.value,
      pageSize: pageSize.value,
      courseType: searchForm.courseType,
      status: searchForm.status,
      startDate,
      endDate
    }

    // 根据角色添加不同的查询参数
    if (role.value === 'USER') {
      params.userId = userInfo.value.id
    } else if (role.value === 'COACH') {
      params.coachId = userInfo.value.id
    } else if (role.value === 'ADMIN') {
      params.username = searchForm.username
    }

    const res = await getAppointmentList(params)
    if (res.code === '200') {
      appointments.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    console.error('加载失败:', error)
    ElMessage.error('加载预约列表失败')
  } finally {
    loading.value = false
  }
}

// 取消预约
const handleCancel = async (row) => {
  try {
    await ElMessageBox.confirm('确定要取消该预约吗？', '提示', {
      type: 'warning'
    })
    const res = await cancelAppointment(row.id)
    if (res.code === '200') {
      ElMessage.success('取消预约成功')
      loadAppointments()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消失败:', error)
      ElMessage.error('取消预约失败')
    }
  }
}

// 查看详情
const handleDetail = (row) => {
  Object.assign(detailForm, row)
  detailVisible.value = true
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  loadAppointments()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  loadAppointments()
}

const handleCurrentChange = (val) => {
  page.value = val
  loadAppointments()
}

onMounted(() => {
  loadAppointments()
})
</script>

<style scoped>
.appointment-container {
  padding: 20px;
}

.search-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>