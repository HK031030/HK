<template>
  <div class="appointment-container">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchForm.username"
        placeholder="用户名"
        style="width: 200px"
        clearable
      />
      <el-select v-model="searchForm.courseType" placeholder="课程类型" clearable>
        <el-option label="科目一" value="科目一" />
        <el-option label="科目二" value="科目二" />
        <el-option label="科目三" value="科目三" />
        <el-option label="科目四" value="科目四" />
      </el-select>
      <el-select v-model="searchForm.status" placeholder="预约状态" clearable>
        <el-option label="待审核" value="待审核" />
        <el-option label="已通过" value="已通过" />
        <el-option label="已拒绝" value="已拒绝" />
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
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="courseName" label="课程名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="courseType" label="课程类型" width="100" />
      <el-table-column prop="appointmentTime" label="预约时间" width="180" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
      <el-table-column prop="createTime" label="申请时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button 
            v-if="row.status === '待审核'"
            type="success" 
            size="small" 
            @click="handleApprove(row)"
          >通过</el-button>
          <el-button 
            v-if="row.status === '待审核'"
            type="danger" 
            size="small" 
            @click="handleReject(row)"
          >拒绝</el-button>
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

    <!-- 审核对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form :model="form" ref="formRef" label-width="80px">
        <el-form-item label="审核结果" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="已通过">通过</el-radio>
            <el-radio label="已拒绝">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核备注" prop="remark">
          <el-input 
            v-model="form.remark" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入审核备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAudit">确定</el-button>
      </template>
    </el-dialog>
    <!-- 详情对话框 -->
  <el-dialog
    v-model="detailDialogVisible"
    title="预约详情"
    width="500px"
  >
    <el-descriptions :column="1" border>
      <el-descriptions-item label="用户名">{{ detailForm.username }}</el-descriptions-item>
      <el-descriptions-item label="课程名称">{{ detailForm.courseName }}</el-descriptions-item>
      <el-descriptions-item label="课程类型">{{ detailForm.courseType }}</el-descriptions-item>
      <el-descriptions-item label="预约时间">{{ detailForm.appointmentTime }}</el-descriptions-item>
      <el-descriptions-item label="状态">{{ detailForm.status }}</el-descriptions-item>
      <el-descriptions-item label="备注">{{ detailForm.remark || '无' }}</el-descriptions-item>
      <el-descriptions-item label="申请时间">{{ detailForm.createTime }}</el-descriptions-item>
      <el-descriptions-item label="教练">
        {{ detailForm.coachName || '未分配' }}
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="detailDialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getAppointmentList, auditAppointment } from '@/api/appointment'

// 列表数据
const appointments = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 用户信息和角色
const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'));
const role = ref(userInfo.value.role || '');

// 权限检查函数
const hasPermission = (permission) => {
  const permissions = {
    'ADMIN': ['course-appointment', 'course-appointment-audit'],
    'COACH': ['course-appointment', 'course-appointment-audit'],
    'USER': [] // USER 无权访问此页面
  };
  return permissions[role.value]?.includes(permission) || false;
};

// 检查是否可以审核预约（COACH 只能审核自己课程的预约）
const canAuditAppointment = (row) => {
  if (role.value === 'ADMIN') return true;
  if (role.value === 'COACH') {
    // 假设后端返回的 appointment 数据中包含 courseId 和 coachId
    return row.coachId === userInfo.value.id;
  }
  return false;
};
// 搜索表单
const searchForm = reactive({
  username: '',
  courseType: '',
  status: '',
  dateRange: []
})

// 详情对话框相关
const detailDialogVisible = ref(false);
const detailForm = reactive({
  id: '',
  username: '',
  courseName: '',
  courseType: '',
  appointmentTime: '',
  status: '',
  remark: '',
  createTime: '',
  coachName: '' // 假设后端返回教练名称
});

// 获取状态标签类型
const getStatusType = (status) => {
  const map = {
    '待审核': 'warning',
    '已通过': 'success',
    '已拒绝': 'danger'
  }
  return map[status]
}

// 加载预约列表
const loadAppointments = async () => {
  loading.value = true
  try {
    const [startDate, endDate] = searchForm.dateRange || []
    const res = await getAppointmentList({
      page: page.value,
      pageSize: pageSize.value,
      username: searchForm.username,
      courseType: searchForm.courseType,
      status: searchForm.status,
      startDate,
      endDate
    })
    if (role.value === 'COACH') {
      params.coachId = userInfo.value.id; // COACH 只能看到自己课程的预约
    }
    if (res.code === '200') {
      appointments.value = res.data.records
      total.value = res.data.total
    }
    else {
      ElMessage.error(res.msg || '加载预约列表失败');
    }
  } catch (error) {
    console.error('加载失败:', error)
    ElMessage.error('加载预约列表失败')
  } finally {
    loading.value = false
  }
}

// 重置搜索
const resetSearch = () => {
  searchForm.username = ''
  searchForm.courseType = ''
  searchForm.status = ''
  searchForm.dateRange = []
  loadAppointments()
}

// 处理审核通过
const handleApprove = (row) => {
  form.id = row.id
  form.status = '已通过'
  form.remark = ''
  dialogTitle.value = '审核通过'
  dialogVisible.value = true
}

// 处理审核拒绝
const handleReject = (row) => {
  if (!canAuditAppointment(row)) {
    ElMessage.warning('您无权审核此预约');
    return;
  }
  form.id = row.id
  form.status = '已拒绝'
  form.remark = ''
  dialogTitle.value = '审核拒绝'
  dialogVisible.value = true
}

// 提交审核
const submitAudit = async () => {
  try {
    const res = await auditAppointment(form.id, {
      status: form.status,
      remark: form.remark
    })
    if (res.code === '200') {
      ElMessage.success('审核成功')
      dialogVisible.value = false
      loadAppointments()
    }
    else {
      ElMessage.error(res.msg || '审核失败');
    }
  } catch (error) {
    console.error('审核失败:', error)
    ElMessage.error('审核失败')
  }
}

// 查看详情（弹窗实现）
const handleDetail = (row) => {
  Object.assign(detailForm, {
    id: row.id,
    username: row.username,
    courseName: row.courseName,
    courseType: row.courseType,
    appointmentTime: row.appointmentTime,
    status: row.status,
    remark: row.remark,
    createTime: row.createTime,
    coachName: row.coachName || '未分配' // 需要后端返回
  });
  detailDialogVisible.value = true;
};

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
  // 如果 USER 访问此页面，直接提示无权限（主菜单已限制，这里为额外防护）
  if (role.value === 'USER') {
    ElMessage.error('您无权访问此页面');
    return;
  }
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

:deep(.el-table) {
  margin-top: 20px;
}

:deep(.el-tag) {
  width: 60px;
  text-align: center;
}
</style>