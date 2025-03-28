<template>
  <div class="dashboard-container">
    <!-- 统计卡片区域 -->
    <el-row :gutter="20" class="stats-row">
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
    <!-- 公告展示卡片 -->
    <el-card class="announcement-card" v-loading="loading">
      <template #header>
        <div class="card-header-with-action">
          <span>系统公告({{announcements.length}})</span>
          <el-button
            v-if="role === 'ADMIN'"
            type="primary"
            size="small"
            @click="$router.push('/manager/notice')"
          >
            管理公告
          </el-button>
        </div>
      </template>
      
      <el-empty v-if="!announcements.length" description="暂无公告" />
      
      <div v-else class="announcement-list">
        <div
          v-for="item in announcements"
          :key="item.id"
          class="announcement-item"
        >
          <div class="announcement-title">
            <el-tag size="small" :type="item.type" class="mr-2">
              {{ item.typeText }}
            </el-tag>
            {{ item.title }}
          </div>
          <div class="announcement-content text-gray-600">
            {{ item.content }}
          </div>
          <div class="announcement-footer text-gray-400 text-sm">
            <span>{{ item.time }}</span>
            <el-divider direction="vertical" />
            <span>发布人: {{ item.username }}</span>
          </div>
        </div>
      </div>
    </el-card>
    <!-- 管理员专属区域 -->
    <div v-if="role === 'ADMIN'">

      <!-- 管理员快捷操作区域 -->
      <el-row :gutter="25" class="quick-actions">
        <el-col :span="24">
          <h2>快捷操作</h2>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4" v-for="(action, index) in adminQuickActions" :key="index">
          <el-card class="action-card" shadow="hover" @click="handleQuickAction(action.route)">
            <el-icon :size="30" class="action-icon">
              <component :is="action.icon"></component>
            </el-icon>
            <div class="action-name">{{ action.name }}</div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 教练专属区域 -->
    <div v-if="role === 'COACH'">
    <el-card class="schedule-card">
      <template #header>
        <div class="card-header">
          <span class="title">近期课程安排</span>
          <el-button type="primary" link @click="viewAllCourses">查看全部</el-button>
        </div>
      </template>

      <el-table 
        :data="todayCourses" 
        v-loading="loading.courses"
        style="width: 100%"
      >
        <el-table-column 
          prop="startTime" 
          label="开始时间" 
          width="160"
          :formatter="formatDateTime"
        />
        <el-table-column 
          prop="title" 
          label="课程名称"
          show-overflow-tooltip 
        />
        <el-table-column 
          label="学员人数" 
          width="100"
        >
          <template #default="{ row }">
            {{ row.currentCount }}/{{ row.maxCount }}
          </template>
        </el-table-column>
        <el-table-column 
          label="状态" 
          width="100"
        >
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column 
          label="操作" 
          width="150"
          fixed="right"
        >
        <template #default="{ row }">
          <el-button 
            size="small"
            type="primary"
            @click="$router.push('/manager/course')"
        >
      查看
    </el-button>
  </template>
          
        </el-table-column>
      </el-table>
    </el-card>
  </div>

  <div class="recommended-courses">
    <el-row :gutter="20" v-loading="loading">
      <el-col 
        v-for="course in recommendedCourses" 
        :key="course.id" 
        :span="8"
      >
        <el-card shadow="hover" class="course-card">
          <img :src="course.image" class="course-image">
          <div class="course-info">
            <h3>{{ course.title }}</h3>
            <p>{{ course.description }}</p>
            <div class="course-meta">
              <span>课时：{{ course.during }}</span>
              <span>教练：{{ course.coachName }}</span>
              <span>剩余名额：{{ course.remain }}</span>
            </div>
            <div class="course-status">
              <el-tag :type="course.status === 'RESERVED' ? 'success' : 'info'">
                {{ course.status === 'RESERVED' ? '已预约' : '可预约' }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
    <!-- 用户/学员专属区域 -->
    <div v-if="role === 'USER'">
      <!-- 我的预约 -->
      <el-card class="my-appointment-card">
  <template #header>
    <div class="card-header-with-action">
      <span class="header-title">我的预约</span>
      <el-button type="primary" size="small" @click="viewAllAppointments">
        查看全部
      </el-button>
    </div>
  </template>
  
  <div v-loading="loading.appointments" class="appointment-content">
    <el-empty 
      v-if="!recommendedCourses.length" 
      description="暂无可预约课程" 
      :image-size="120"
    />
    
    <el-table 
      v-else 
      :data="recommendedCourses" 
      style="width: 100%"
      :header-cell-style="{ background: '#f5f7fa' }"
      border
    >
      <el-table-column prop="type" label="科目" width="120">
        <template #default="{ row }">
          <span class="course-type">{{ row.type }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="预约时间" min-width="220">
        <template #default="{ row }">
          <div class="time-range">
            <el-icon><Timer /></el-icon>
            <span>{{ formatDateTime(row.startTime) }}</span>
            <el-divider direction="vertical" />
            <span>{{ formatDateTime(row.endTime) }}</span>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag 
            :type="getStatusTagType(row.status)"
            size="small"
            effect="light"
          >
            {{ getAppointmentStatus(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column fixed="right" label="操作" width="150" align="center">
        <template #default="{ row }">
          <el-button 
            v-if="row.status === 'RESERVED'"
            link 
            type="danger" 
            :icon="Delete"
            @click="handleCancelReservation(row)"
          >
            取消预约
          </el-button>
          <el-button 
            v-else
            link 
            type="primary" 
            :icon="Check"
            @click="handleReservation(row)"
            :disabled="row.remain === 0"
          >
            立即预约
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</el-card>
    </div>
    <FloatingCar :role="role" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import CountTo from 'vue3-count-to';
import { getNoticeList } from '@/api/notice'
import { getCourseList } from '@/api/course' 
import FloatingCar from '@/components/dashboard/FloatingCar.vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { 
  getUserReservations_List,  // 获取预约列表
  getUserReservations,       // 获取预约状态
  cancelReservation 
} from '@/api/reservation'

const router = useRouter();
const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'));
const role = ref(userInfo.value.role || 'USER');
// const loading = ref(false);

const loading = ref({
  courses: false,
  recommended: false,
  notices: false,
  appointments: false
})

const recommendedCourses = ref([])
// 检查用户预约状态
const checkUserReservations = async () => {
  try {
    const res = await getUserReservations(userInfo.value.id)
    console.log('预约状态响应:', res)
    
    if (res.code === '200') {
      const reservationsData = res.data || []
      
      // 创建预约映射
      const reservationMap = new Map(
        reservationsData.map(reservation => [reservation.courseId, {
          id: reservation.id,
          status: reservation.status || 'NOT_RESERVED'
        }])
      )
      
      // 更新推荐课程的预约状态
      recommendedCourses.value = recommendedCourses.value.map(course => ({
        ...course,
        status: reservationMap.get(course.id)?.status || 'NOT_RESERVED'
      }))
      
      console.log('更新后的推荐课程:', recommendedCourses.value)
    }
  } catch (error) {
    console.error('获取预约状态失败:', error)
    ElMessage.error('获取预约状态失败')
  }
}

// 管理员快捷操作
const adminQuickActions = ref([
  { name: '添加新用户', icon: 'User', route: '/manager/user/add' },
  { name: '添加新课程', icon: 'Document', route: '/manager/course/add' },
  { name: '查看预约', icon: 'Van', route: '/manager/appointment/admin'},
  { name: '发布公告', icon: 'Bell', route: '/manager/notice/add' },
  { name: '查看日志', icon: 'Files', route: '/manager/logs' },
]);


// 公告数据
const announcements = ref([])
const params = ref({
  pageNum: 1,
  pageSize: 5,
  title: ''
});

// 获取公告列表
const loadNotices = async () => {
  try {
    loading.value = true;
    console.log('开始加载公告...');
    const res = await getNoticeList({
      pageNum: params.value.pageNum,  // 使用 .value 访问 ref 值
      pageSize: params.value.pageSize, // 使用 .value 访问 ref 值
      title: params.value.title 
    });
    console.log('公告接口响应:', res);
    
    if (res.code === '200') {
      // 只过滤出重要公告（top 值为 1 的公告）
      announcements.value = res.data.records
        .filter(notice => notice.top === 1|| notice.top === 2)  // 只保留重要公告
        .map(notice => ({
          id: notice.id,
          title: notice.title,
          content: notice.content,
          time: notice.time,
          username: notice.username,
          type: getNoticeType(notice.top),
          typeText: getNoticeTypeText(notice.top)
        }));
      console.log('处理后的重要公告数据:', announcements.value);
    }
  } catch (error) {
    console.error('获取公告列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 修改类型判断方法
const getNoticeType = (top) => {
  switch (Number(top)) {
    case 1: return 'danger';    // top=1 表示最重要
    case 2: return 'warning';   // top=2 表示次重要
    case 0: return 'info';      // top=0 表示普通
    default: return 'info';     // 默认返回普通
  }
};

// 修改类型文本方法
const getNoticeTypeText = (top) => {
  switch (top) {
    case 1: return '重要';
    case 2: return '通知';
    case 0: return '普通';
    default: return '普通';
  }
};

// 教练今日课程数据
const todayCourses = ref([]);
// 获取今日课程

// 获取教练课程列表
const loadRecentCourses = async () => {
  if (!loading.value || typeof loading.value !== 'object') {
    loading.value = { courses: false }
  }
  
  try {
    loading.value.courses = true
    
    const params = {
      pageNum: 1,
      pageSize: 5,
      coachId: userInfo.value.id,
      sortBy: 'startTime',
      sortOrder: 'asc'
    }
    
    console.log('请求参数:', params)
    const res = await getCourseList(params)
    console.log('课程响应:', res)

    if (res.code === '200') {
      todayCourses.value = res.data.records.map(course => ({
        id: course.id,
        title: course.title,
        startTime: course.startTime,
        endTime: course.endTime,
        currentCount: course.currentCount || 0,
        maxCount: course.maxCount || 30,
        location: course.location || '未设置',
        status: course.status || 0,
        type: course.type,
        coachId: course.coachId,
        coachName: course.coachName
      }))
      console.log('处理后的课程数据:', todayCourses.value)
    } else {
      ElMessage.error(res.msg || '获取课程失败')
    }
  } catch (error) {
    console.error('获取课程失败:', error)
    ElMessage.error('获取课程数据失败')
  } finally {
    if (loading.value && typeof loading.value === 'object') {
      loading.value.courses = false
    }
  }
}

// 格式化日期时间
const formatDateTime = (time) => {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    0: 'info',    // 未开始
    1: 'success', // 进行中
    2: 'warning', // 已结束
    3: 'danger'   // 已取消
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '未开始',
    1: '进行中',
    2: '已结束',
    3: '已取消'
  }
  return statusMap[status] || '未知'
}

// 判断是否可以开始课程
// const canStartCourse = (course) => {
//   if (course.status !== 0) return false
//   const now = dayjs()
//   const courseTime = dayjs(course.startTime)
//   return now.isAfter(courseTime.subtract(30, 'minute')) && 
//          now.isBefore(courseTime.add(course.during, 'hour'))
// }

// 查看全部课程
// const viewAllCourses = () => {
//   router.push('/manager/course')
// }

const courseImages = [
  '/src/assets/imgs/course2.jpg',
  '/src/assets/imgs/course3.jpg',
  '/src/assets/imgs/course1.jpg'
]
// 修改加载推荐课程的函数
const loadRecommendedCourses = async () => {
  try {
    loading.value = true;
    const params = {
      pageNum: 1,
      pageSize: 3,  // 只获取3个推荐课程
      title: '',
      type: '',
      // 如果是教练角色，只获取自己的课程
      ...(role.value === 'COACH' ? { coachId: userInfo.value.id } : {})
    }

    const res = await getCourseList(params)
    console.log('推荐课程响应:', res)

    if (res.code === '200') {
      recommendedCourses.value = (res.data.records || []).map(record => ({
        id: record.id,
        title: record.title,
        description: record.description,
        type: record.type || '未知',
        during: record.during || 30,
        startTime: record.startTime,
        endTime: record.endTime,
        createdTime: record.createdTime,
        coachId: record.coachId,
        coachName: record.coachName,
        remain: record.remain || 30,
        status: record.status,
        // 添加默认图片
        image: record.image || courseImages[record.id % 3]
      }))

      // 如果是用户角色，检查预约状态
      if (role.value === 'USER') {
        await checkUserReservations();
      }

      console.log('处理后的推荐课程:', recommendedCourses.value);
    } else {
      ElMessage.error(res.msg || '加载推荐课程失败')
    }
  } catch (error) {
    console.error('加载推荐课程失败:', error)
    ElMessage.error('加载推荐课程失败')
  } finally {
    loading.value = false
  }
}

// 学员的预约记录
const myAppointments = ref([]);
// 获取预约状态显示
const getAppointmentStatus = (status) => {
  const statusMap = {
    'RESERVED': '已预约',
    'NOT_RESERVED': '未预约',
    'CANCELLED': '已取消'  // 保留取消状态以支持取消预约功能
  }
  return statusMap[status] || '未预约'
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    'RESERVED': 'success',
    'NOT_RESERVED': 'info',
    'CANCELLED': 'danger'
  }
  return typeMap[status] || 'info'
}

// 修改预约记录的数据转换
const loadMyAppointments = async () => {
  if (!userInfo.value.id) return
  
  try {
    // 确保 loading 是一个对象
    if (typeof loading.value !== 'object') {
      loading.value = {
        courses: false,
        recommended: false,
        notices: false,
        appointments: false
      }
    }
    
    loading.value.appointments = true
    const res = await getUserReservations_List({
      pageNum: 1,
      pageSize: 5,
      userId: userInfo.value.id
    })
    
    if (res.code === '200' && res.data?.records) {
      myAppointments.value = res.data.records.map(item => ({
        id: item.id,
        courseId: item.courseId,
        type: item.type || '未知科目',
        name: item.name,
        startTime: item.startTime,
        endTime: item.endTime,
        status: item.status || 'NOT_RESERVED'
      }))
    }
  } catch (error) {
    console.error('获取预约失败:', error)
    ElMessage.error('获取预约数据失败')
  } finally {
    if (typeof loading.value === 'object') {
      loading.value.appointments = false
    }
  }
}
// 查看预约详情
const viewAppointmentDetail = (appointment) => {
  if (!appointment.courseId) {
    ElMessage.warning('课程信息不存在')
    return
  }
  router.push({
    path: '/manager/course',
    query: { 
      courseId: appointment.courseId
    }
  })
}

// 取消预约
const cancelAppointment = async (appointment) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消这个预约吗？',
      '取消预约',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const res = await cancelReservation(userInfo.value.id, appointment.id)
    if (res.code === '200') {
      ElMessage.success('预约已取消')
      await loadMyAppointments()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消预约失败:', error)
      ElMessage.error('取消预约失败')
    }
  }
}
// 添加预约操作方法
const handleReservation = async (course) => {
  try {
    const payload = {
      courseId: course.id,
      userId: userInfo.value.id
    }
    
    const res = await createReservation(payload)
    if (res.code === '200') {
      ElMessage.success('预约成功')
      // 更新课程状态
      course.status = 'RESERVED'
      course.remain = Math.max(0, course.remain - 1)
      await checkUserReservations()
    } else {
      throw new Error(res.msg || '预约失败')
    }
  } catch (error) {
    console.error('预约失败:', error)
    ElMessage.error('预约失败')
  }
}

// 添加取消预约方法
const handleCancelReservation = async (course) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消这个预约吗？',
      '取消预约',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const res = await cancelReservation(userInfo.value.id, course.id)
    if (res.code === '200') {
      ElMessage.success('取消预约成功')
      // 更新课程状态
      course.status = 'NOT_RESERVED'
      course.remain = course.remain + 1
      await checkUserReservations()
    } else {
      throw new Error(res.msg || '取消预约失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消预约失败:', error)
      ElMessage.error('取消预约失败')
    }
  }
}
// 学员操作方法
const viewAllAppointments = () => {
  router.push('/appointment/Userappointment');
};

// 管理员操作方法
const handleQuickAction = (route) => {
  router.push(route);
};


onMounted(async () => {
  try {
    // 确保 loading 的所有属性都已初始化
    loading.value = {
      courses: false,
      recommended: false,
      notices: false,
      appointments: false
    }

    const loadPromises = []
    
    // 根据角色加载不同数据
    if (role.value === 'USER') {
      loadPromises.push(loadRecommendedCourses())
      loadPromises.push(loadMyAppointments())
    } else if (role.value === 'COACH') {
      loadPromises.push(loadRecentCourses())
    }
    
    // 公告是所有角色都需要加载的
    loadPromises.push(loadNotices())

    await Promise.all(loadPromises)
  } catch (error) {
    console.error('初始化数据失败:', error)
    ElMessage.error('加载数据失败')
  }
})
</script>

<style lang="scss" scoped>
/* 全局样式 */
.dashboard-container {
  padding: 20px;
  position: relative;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}

/* 统计卡片样式 */
.stats-row {
  margin-bottom: 20px;
}

.data-card {
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 0;
}

.card-number {
  font-size: 28px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 5px;
}

.card-title {
  font-size: 14px;
  color: #606266;
}

.card-footer {
  background-color: #f6f8fa;
  padding: 10px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #ebeef5;
}

.card-footer .el-icon {
  font-size: 24px;
  color: #409EFF;
}

/* 公告区域样式 */
.announcement-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.announcement-header h3 {
  margin: 0;
}

.announcement-list {
  max-height: 300px;
  overflow-y: auto;
}

.announcement-item {
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
}

.announcement-item:last-child {
  border-bottom: none;
}

.announcement-title {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-weight: bold;
}

.announcement-title .el-icon {
  margin-right: 10px;
  color: #f56c6c;
}

.announcement-title .el-tag {
  margin-left: 10px;
}

.announcement-content {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 10px;
  white-space: pre-line;
}

.announcement-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

/* 快捷操作区域 */
.quick-actions {
  margin-bottom: 20px;
}

.action-card {
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 8px;
  margin-bottom: 20px;
}

.action-card:hover {
  transform: translateY(-5px);
  background-color: #f5f7fa;
}

.action-icon {
  margin-bottom: 10px;
  color: #409EFF;
}

.action-name {
  font-size: 14px;
  color: #606266;
}

/* 卡片头部带操作样式 */
.card-header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 课程表样式 */
.schedule-card {
  margin-bottom: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .title {
      font-size: 16px;
      font-weight: bold;
    }
  }
}

.el-tag {
  width: 65px;
  text-align: center;
}

/* 课程推荐样式 */
.recommended-courses {
  margin: 20px 0;
  
  .course-card {
    margin-bottom: 20px;
    
    .course-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    
    .course-info {
      padding: 15px;
      
      h3 {
        margin: 0 0 10px;
        font-size: 18px;
      }
      
      .course-meta {
        margin: 10px 0;
        display: flex;
        justify-content: space-between;
        color: #666;
        font-size: 14px;
      }
      
      .course-status {
        text-align: right;
      }
    }
  }
}
/*我的预约*/
.my-appointment-card {
  margin: 20px 0;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  
  :deep(.el-card__header) {
    padding: 15px 20px;
    border-bottom: 1px solid var(--el-border-color-light);
    background: #f8f9fb;
    
    .header-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
  
  .appointment-content {
    padding: 10px 0;
    
    .course-type {
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
    
    .time-range {
      display: flex;
      align-items: center;
      color: var(--el-text-color-regular);
      
      .el-icon {
        margin-right: 5px;
        color: var(--el-text-color-secondary);
      }
    }
    
    :deep(.el-table) {
      --el-table-border-color: var(--el-border-color-lighter);
      --el-table-header-bg-color: #f5f7fa;
      
      th {
        font-weight: 600;
      }
      
      .el-button {
        padding: 4px 0;
        
        .el-icon {
          margin-right: 4px;
        }
      }
    }
    
    .el-tag {
      width: 70px;
      justify-content: center;
      
      &--success {
        --el-tag-bg-color: var(--el-color-success-light-9);
      }
      
      &--danger {
        --el-tag-bg-color: var(--el-color-danger-light-9);
      }
      
      &--info {
        --el-tag-bg-color: var(--el-color-info-light-9);
      }
    }
  }
}

/* 适配移动端 */
@media screen and (max-width: 768px) {
  .my-appointment-card {
    margin: 10px;
    
    .time-range {
      flex-direction: column;
      align-items: flex-start;
      
      .el-divider {
        display: none;
      }
    }
  }
}
/* 状态颜色 */
.el-tag--success {
  background-color: #f0f9eb;
  border-color: #e1f3d8;
  color: #67c23a;
}

.el-tag--danger {
  background-color: #fef0f0;
  border-color: #fde2e2;
  color: #f56c6c;
}

.el-tag--warning {
  background-color: #fdf6ec;
  border-color: #faecd8;
  color: #e6a23c;
}

.el-tag--info {
  background-color: #f4f4f5;
  border-color: #e9e9eb;
  color: #909399;
}

/* 表格内按钮间距 */
.el-table .el-button {
  margin-right: 5px;
}

/* 加载动画容器 */
.el-loading-mask {
  background-color: rgba(255, 255, 255, 0.9);
}

/* Element Plus 默认样式修改 */
.el-card {
  --el-card-padding: 15px;
  --el-card-border-color: #ebeef5;
  --el-card-border-radius: 8px;
}

.el-button--primary {
  --el-button-bg-color: #409EFF;
  --el-button-border-color: #409EFF;
  --el-button-hover-bg-color: #66b1ff;
  --el-button-hover-border-color: #66b1ff;
}

.el-button--danger {
  --el-button-bg-color: #f56c6c;
  --el-button-border-color: #f56c6c;
  --el-button-hover-bg-color: #f78989;
  --el-button-hover-border-color: #f78989;
}

.el-button--success {
  --el-button-bg-color: #67c23a;
  --el-button-border-color: #67c23a;
  --el-button-hover-bg-color: #85ce61;
  --el-button-hover-border-color: #85ce61;
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
