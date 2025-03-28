<template>
  <div class="appointment-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="header-title">预约学员名单</span>
        </div>
      </template>

      <div class="table-section">
        <el-table :data="reservationList" v-loading="loading" border stripe>
          <el-table-column prop="name" label="学员姓名" />
          <el-table-column prop="coachName" label="教练名称" />
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
import { ElMessage } from 'element-plus'
import { getUserReservations_List_Coach } from '@/api/reservation.js'; // 请替换为实际的路径

// 用户信息
const coachInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
const coachId = ref(coachInfo.value.id)

// 列表数据
const reservationList = ref([])
const loading = ref(false)
const total = ref(0)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
})

// 加载用户预约列表
const loadUserReservations = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      coachId: coachId.value, // 传递用户ID
    }

    console.log("请求参数", params); // 打印请求参数
    const res = await getUserReservations_List_Coach(params) // 假设有这个API
    console.log("返回结果", res); // 打印返回结果
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

// 分页处理
const handleSizeChange = (val) => {
  queryParams.pageSize = val
  loadUserReservations()
}

const handleCurrentChange = (val) => {
  queryParams.pageNum = val
  loadUserReservations()
}

// 组件挂载时加载数据
onMounted(() => {
  loadUserReservations();
})
</script>

<style lang="scss" scoped>
@import '@/styles/appointment.scss';
</style>