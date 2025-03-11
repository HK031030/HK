<template>
  <div class="reservation-list">
    <el-table :data="reservations" v-loading="loading" border stripe>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="courseTitle" label="课程名称" min-width="150" />
      <el-table-column prop="userName" label="预约用户" min-width="100" v-if="role !== 'USER'" />
      <el-table-column label="预约时段" min-width="200">
        <template #default="{ row }">
          {{ row.slotStartTime }} - {{ row.slotEndTime }}
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="预约时间" min-width="170" />
    </el-table>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getReservationList } from '@/api/reservation';
import { ElMessage } from 'element-plus';

const props = defineProps({
  userId: Number,
  coachId: Number
});

const reservations = ref([]);
const loading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const role = ref(JSON.parse(localStorage.getItem('userInfo') || '{}').role || '');

const loadReservations = async () => {
  loading.value = true;
  try {
    const params = {
      pageNum: page.value,
      pageSize: pageSize.value,
      userId: props.userId,
      coachId: props.coachId
    };
    const res = await getReservationList(params);
    if (res.code === '200') {
      reservations.value = res.data.records || [];
      total.value = res.data.total || 0;
    } else {
      ElMessage.error(res.msg || '加载预约列表失败');
    }
  } catch (error) {
    console.error('加载预约失败:', error);
    ElMessage.error('加载预约列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  loadReservations();
};

const handleCurrentChange = (val) => {
  page.value = val;
  loadReservations();
};

onMounted(() => {
  loadReservations();
});
</script>

<style scoped>
.reservation-list {
  padding: 20px;
}
.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>