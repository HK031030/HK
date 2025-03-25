<template>
  <div class="appointment-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="header-title">我的预约</span>
          <div class="header-actions">
            <el-button type="primary" @click="$router.push('/user/course')">预约课程</el-button>
          </div>
        </div>
      </template>

      <div class="search-section">
        <el-select v-model="queryParams.status" placeholder="预约状态" @change="handleSearch">
          <el-option label="全部" value="" />
          <el-option label="待审核" value="PENDING" />
          <el-option label="已通过" value="APPROVED" />
          <el-option label="已拒绝" value="REJECTED" />
          <el-option label="已完成" value="COMPLETED" />
        </el-select>
      </div>

      <div class="table-section">
        <el-table :data="reservationList" v-loading="loading" border stripe>
          <el-table-column prop="courseTitle" label="课程名称" />
          <el-table-column prop="coachName" label="教练" />
          <el-table-column prop="appointmentTime" label="预约时间" sortable />
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button 
                v-if="row.status === 'PENDING'"
                type="danger" 
                size="small" 
                @click="handleCancel(row)"
              >
                取消预约
              </el-button>
              <el-button
                v-if="row.status === 'APPROVED'"
                type="success"
                size="small"
                @click="handleComplete(row)"
              >
                完成课程
              </el-button>
            </template>
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
import { ref, onMounted } from 'vue'
import { getUserReservations, cancelReservation } from '@/api/reservation'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getStatusType, getStatusText } from '@/utils/status'

const userStore = useUserStore()
const loading = ref(false)
const total = ref(0)
const reservationList = ref([])

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  status: '',
  userId: userStore.userId
})

// 加载预约列表
const loadReservations = async () => {
  try {
    loading.value = true
    const res = await getUserReservations(queryParams.value)
    if (res.code === '200') {
      reservationList.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取预约列表失败:', error)
    ElMessage.error('获取预约列表失败')
  } finally {
    loading.value = false
  }
}

// 处理取消预约
const handleCancel = async (row) => {
  try {
    await ElMessageBox.confirm('确定要取消该预约吗?', '提示', {
      type: 'warning'
    })
    const res = await cancelReservation(row.userId, row.slotId)
    if (res.code === '200') {
      ElMessage.success('取消预约成功')
      loadReservations()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消预约失败:', error)
      ElMessage.error('取消预约失败')
    }
  }
}

// 分页方法
const handleSizeChange = (val) => {
  queryParams.value.pageSize = val
  loadReservations()
}

const handleCurrentChange = (val) => {
  queryParams.value.pageNum = val
  loadReservations()
}

const handleSearch = () => {
  queryParams.value.pageNum = 1
  loadReservations()
}

onMounted(() => {
  loadReservations()
})
</script>

<style lang="scss" scoped>
@import '@/styles/appointment.scss';
</style>