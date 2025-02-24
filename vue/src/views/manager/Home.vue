<template>
  <div class="dashboard-container">
    <!-- 统计卡片区域 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in cardData" :key="index">
        <el-card class="data-card">
          <div class="card-header">
            <count-to
              :start-val="0"
              :end-val="item.value"
              :duration="2000"
              :autoplay="true"
              class="card-number"
            />
            <div class="card-title">{{ item.title }}</div>
          </div>
          <div class="card-footer">
            <el-icon>
              <component :is="item.icon"></component>
            </el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>近七日报名趋势</span>
            </div>
          </template>
          <div class="chart-content">
            <line-chart :chart-data="weeklyData" />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>车辆使用情况</span>
            </div>
          </template>
          <div class="chart-content">
            <pie-chart :chart-data="vehicleUsageData" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 系统公告区域 -->
    <el-row style="margin-top: 20px;">
      <el-col :span="24">
        <el-card class="notice-card">
          <template #header>
            <div class="notice-header">
              <span>系统公告</span>
              <el-button type="text" @click="moreNotice">查看更多</el-button>
            </div>
          </template>
          <div class="notice-list">
            <div v-for="notice in notices" :key="notice.id" class="notice-item">
              <div class="notice-title">{{ notice.title }}</div>
              <div class="notice-time">{{ notice.createTime }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Document, Van, Calendar } from '@element-plus/icons-vue'
import CountTo from 'vue3-count-to'
import LineChart from '@/components/LineChart.vue'
import PieChart from '@/components/PieChart.vue'

const router = useRouter()

// 统计数据
const statisticsData = ref({
  studentCount: 0,
  courseCount: 0,
  vehicleCount: 0,
  todayLessons: 0
})

// 卡片数据
const cardData = computed(() => [
  { title: '学员总数', value: statisticsData.value.studentCount, icon: 'User' },
  { title: '课程总数', value: statisticsData.value.courseCount, icon: 'Document' },
  { title: '车辆总数', value: statisticsData.value.vehicleCount, icon: 'Van' },
  { title: '今日课程', value: statisticsData.value.todayLessons, icon: 'Calendar' }
])

// 周数据
const weeklyData = ref({
  labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  datasets: [{
    label: '报名人数',
    data: [30, 42, 35, 50, 45, 38, 40],
    borderColor: '#409EFF',
    backgroundColor: 'rgba(64, 158, 255, 0.2)'
  }]
})

// 车辆使用数据
const vehicleUsageData = ref({
  labels: ['使用中', '空闲', '维修中'],
  datasets: [{
    data: [25, 15, 5],
    backgroundColor: ['#67C23A', '#409EFF', '#F56C6C']
  }]
})

// 公告数据
const notices = ref([
  {
    id: 1,
    title: '关于2024年春节放假安排的通知',
    createTime: '2024-02-22'
  },
  {
    id: 2,
    title: '新版驾考系统升级公告',
    createTime: '2024-02-21'
  },
  {
    id: 3,
    title: '关于增加科目二训练场地的通知',
    createTime: '2024-02-20'
  }
])

// 获取数据
const fetchData = async () => {
  try {
    // 模拟接口调用
    statisticsData.value = {
      studentCount: 256,
      courseCount: 12,
      vehicleCount: 45,
      todayLessons: 28
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

// 查看更多公告
const moreNotice = () => {
  router.push('/manager/announcement')
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;

  .data-card {
    height: 108px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);
    
    &:hover {
      transform: translateY(-2px);
      transition: all 0.3s;
    }

    .card-header {
      padding: 20px;
      
      .card-number {
        font-size: 30px;
        font-weight: bold;
      }

      .card-title {
        margin-top: 8px;
        font-size: 16px;
        color: rgba(0, 0, 0, 0.45);
      }
    }

    .card-footer {
      position: absolute;
      right: 20px;
      bottom: 20px;
      font-size: 48px;
      opacity: 0.1;
    }
  }

  .chart-card {
    margin-bottom: 20px;

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 10px;
    }

    .chart-content {
      height: 300px;
      padding: 10px;
    }
  }

  .notice-card {
    .notice-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .notice-list {
      .notice-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .notice-title {
          color: #333;
          cursor: pointer;

          &:hover {
            color: #409EFF;
          }
        }

        .notice-time {
          color: #999;
          font-size: 14px;
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
    
    .data-card {
      margin-bottom: 10px;
    }
  }
}
</style>
