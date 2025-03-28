<template>
  <div class="appointment-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="header-title">预约管理</span>
        </div>
      </template>

      <div class="search-section">
        <el-select v-model="selectedCoach" style="width: 230px" placeholder="选择教练" @change="handleSearch">
          <el-option
              v-for="coach in coaches"
              :key="coach.id"
              :label="coach.name"
          :value="coach.id"
          />
        </el-select>
        <div>
          <el-button type="primary" @click="resetSelection">重置</el-button>
        </div>
      </div>

      <div class="table-section">
        <el-table :data="reservationList" v-loading="loading" border stripe>
          <el-table-column prop="id" label="序号" />
          <el-table-column prop="username" label="学员姓名" />
          <el-table-column prop="coachName" label="教练姓名" />
          <el-table-column prop="type" label="课程名称" />
          <el-table-column prop="startTime" label="预约开始时间" sortable />
          <el-table-column prop="endTime" label="预约结束时间" sortable >
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-section">
        <el-pagination
            v-model:current-page="queryParams.pageNum"
            v-model:page-size="queryParams.pageSize"
            :total="total"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCoaches, getReservationList, cancelReservation } from '@/api/reservation.js'; // 请替换为实际的路径

// 管理员信息和角色
const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
const role = ref(userInfo.value.role || 'ADMIN')

// 列表数据
const reservationList = ref([])
const loading = ref(false)
const total = ref(0)
const selectedCoach = ref(null) // 选中的教练ID
const coaches = ref([]) // 教练列表

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
})

// 加载教练列表
const loadCoaches = async () => {
  try {
    const res = await getCoaches(); // 假设有这个API
    if (res.code === '200') {
      coaches.value = res.data; // 设置教练列表
      console.log("res", res)
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    console.error('加载教练失败:', error);
    ElMessage.error('加载教练列表失败');
  }
}

// 加载预约列表
const loadReservations = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      coachId: selectedCoach.value !== null ? selectedCoach.value : null, // 添加教练ID或null
    }

    console.log("请求参数", params); // 打印请求参数
    const res = await getReservationList(params) // 假设有这个API
    console.log("返回结果", res); // 打印返回结果
    console.log("返回结果res.data.records", res.data.records);
    if (res.code === '200') {
      reservationList.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error(res.msg)
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
    const res = await cancelReservation(row.id) // 假设有这个API
    if (res.code === '200') {
      ElMessage.success('取消预约成功')
      loadReservations()
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
  // 处理查看详情逻辑
}

// 导出数据
const handleExport = async () => {
  // 处理导出数据逻辑
}

// 搜索
const handleSearch = () => {
  queryParams.pageNum = 1; // 重置为第一页
  loadReservations();
}

// 重置选择
const resetSelection = () => {
  selectedCoach.value = null; // 重置为初始值
  loadReservations(); // 重新加载预约列表
}

// 分页处理
const handleSizeChange = (val) => {
  queryParams.pageSize = val
  loadReservations()
}

const handleCurrentChange = (val) => {
  queryParams.pageNum = val
  loadReservations()
}

// 组件挂载时加载数据
onMounted(() => {
  loadCoaches();
  loadReservations();
})
</script>

<style lang="scss" scoped>
@import '@/styles/appointment.scss';
</style>