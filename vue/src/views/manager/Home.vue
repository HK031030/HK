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
            <span>发布人: {{ item.author }}</span>
          </div>
        </div>
      </div>
    </el-card>
    <!-- 管理员专属区域 -->
    <div v-if="role === 'ADMIN'">
      <!-- 系统监控区域 -->
      <div class="monitoring-section">
        <h2>系统状态监控</h2>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8">
            <el-card class="monitor-card">
              <div class="monitor-title">服务器状态</div>
              <div class="monitor-value" :class="{ 'healthy': systemHealth.server }">{{ systemHealth.server ? '正常' : '异常' }}</div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-card class="monitor-card">
              <div class="monitor-title">数据库连接</div>
              <div class="monitor-value" :class="{ 'healthy': systemHealth.database }">{{ systemHealth.database ? '正常' : '异常' }}</div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-card class="monitor-card">
              <div class="monitor-title">日志处理模块</div>
              <div class="monitor-value" :class="{ 'healthy': systemHealth.logs }">{{ systemHealth.logs ? '正常' : '异常' }}</div>
              <el-button v-if="!systemHealth.logs" type="danger" size="small" class="fix-button" @click="fixLogsSystem">
                修复
              </el-button>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 管理员快捷操作区域 -->
      <el-row :gutter="20" class="quick-actions">
        <el-col :span="24">
          <h2>快捷操作</h2>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6" v-for="(action, index) in adminQuickActions" :key="index">
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
      <!-- 今日课程安排 -->
      <el-card class="schedule-card">
        <template #header>
          <div class="card-header-with-action">
            <span>今日课程安排</span>
            <el-button type="primary" size="small" @click="viewAllSchedule">查看全部</el-button>
          </div>
        </template>
        <el-table :data="todayCourses" style="width: 100%" v-loading="loading.courses">
          <el-table-column prop="time" label="时间" width="180" />
          <el-table-column prop="courseName" label="课程名称" />
          <el-table-column prop="studentCount" label="学员人数" width="100" />
          <el-table-column prop="location" label="地点" />
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button size="small" @click="viewCourseDetail(scope.row)">详情</el-button>
              <el-button size="small" type="primary" @click="startCourse(scope.row)">开始</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 待审核预约 -->
      <el-card class="pending-card">
        <template #header>
          <div class="card-header-with-action">
            <span>待审核预约</span>
            <el-button type="primary" size="small" @click="viewAllPending">查看全部</el-button>
          </div>
        </template>
        <el-table :data="pendingAppointments" style="width: 100%" v-loading="loading.pending">
          <el-table-column prop="studentName" label="学员姓名" />
          <el-table-column prop="courseName" label="课程名称" />
          <el-table-column prop="appointmentTime" label="预约时间" width="180" />
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button size="small" type="success" @click="approveAppointment(scope.row)">通过</el-button>
              <el-button size="small" type="danger" @click="rejectAppointment(scope.row)">拒绝</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 用户/学员专属区域 -->
    <div v-if="role === 'USER'">
      <!-- 我的学习进度 -->
      <el-card class="progress-card">
        <template #header>
          <span>我的学习进度</span>
        </template>
        <div class="progress-container">
          <div class="progress-item" v-for="(item, index) in learningProgress" :key="index">
            <div class="progress-stage">
              <div :class="['stage-icon', { 'completed': item.completed }]">{{ index + 1 }}</div>
              <div class="stage-line" v-if="index < learningProgress.length - 1"></div>
            </div>
            <div class="stage-info">
              <div class="stage-name">{{ item.name }}</div>
              <div class="stage-status">{{ item.completed ? '已完成' : '进行中' }}</div>
              <el-progress 
                :percentage="item.percentage" 
                :status="item.completed ? 'success' : ''" 
                :stroke-width="15"
              ></el-progress>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 课程推荐 -->
      <el-card class="recommendation-card">
    <template #header>
      <div class="card-header-with-action">
        <span>推荐课程</span>
        <el-button type="primary" size="small" @click="$router.push('/user/course')">
          查看全部
        </el-button>
      </div>
    </template>
    <el-row :gutter="20">
      <el-col 
        v-for="course in recommendedCourses" 
        :key="course.id" 
        :xs="24" 
        :sm="12" 
        :md="8"
      >
        <div class="course-item">
          <img :src="course.image" :alt="course.name" class="course-image">
          <div class="course-info">
            <div class="course-name">{{ course.name }}</div>
            <div class="course-desc">{{ course.description }}</div>
            <div class="course-meta">
              <span>
                <el-icon><Timer /></el-icon>
                {{ course.duration }}
              </span>
              <span>
                <el-icon><User /></el-icon>
                {{ course.coach }}
              </span>
              <span>
                <el-icon><Tickets /></el-icon>
                剩余名额: {{ course.remain }}
              </span>
            </div>
            <el-button 
              type="primary" 
              :disabled="!course.remain"
              @click="bookCourse(course)"
            >
              {{ course.remain ? '立即预约' : '名额已满' }}
            </el-button>
          </div>
        </div>
      </el-col>
      <el-empty 
        v-if="!recommendedCourses.length" 
        description="暂无推荐课程" 
      />
    </el-row>
  </el-card>

      <!-- 我的预约 -->
      <el-card class="my-appointment-card">
        <template #header>
          <div class="card-header-with-action">
            <span>我的预约</span>
            <el-button type="primary" size="small" @click="viewAllAppointments">查看全部</el-button>
          </div>
        </template>
        <el-table :data="myAppointments" style="width: 100%" v-loading="loading.appointments">
          <el-table-column prop="courseName" label="课程名称" />
          <el-table-column prop="coach" label="教练" />
          <el-table-column prop="appointmentTime" label="预约时间" width="180" />
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button size="small" @click="viewAppointmentDetail(scope.row)">详情</el-button>
              <el-button 
                v-if="scope.row.status === '待确认'" 
                size="small" 
                type="danger" 
                @click="cancelAppointment(scope.row)"
              >取消</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 悬浮 3D 汽车按钮区域 -->
    <!-- 修改悬浮汽车的模板 -->
<div 
  class="floating-car" 
  @mousedown.prevent="handleDragStart"
  :style="{
    position: 'fixed',
    left: `${dragPosition.x}px`,
    top: `${dragPosition.y}px`,
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    zIndex: isDragging ? 1000 : 999  // 调整拖拽时和非拖拽时的层级
  }"
>
  <img 
    src="/assets/realistic-car.svg" 
    class="car-shape" 
    draggable="false"
    @click="!isDragging && navigateByRole"
  />
  <div 
    class="car-tooltip" 
    :style="{ 
      zIndex: 1001,
      opacity: isDragging ? 0 : undefined 
    }"
  >
    {{carButtonText}}
  </div>
</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import CountTo from 'vue3-count-to';
import { getNoticeList } from '@/api/notice'
import { getCourseList } from '@/api/course' 

const router = useRouter();
const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'));
const role = ref(userInfo.value.role || 'USER');
const loading = ref(false);

// 根据角色显示不同的统计数据
const statisticsData = ref({
  // 管理员看到的统计数据
  admin: {
    studentCount: 256,
    courseCount: 12,
    vehicleCount: 45,
    todayLessons: 28,
    pendingAppointments: 8,
    newUsers: 15
  },
  // 教练看到的统计数据
  coach: {
    myStudents: 45,
    myCourses: 5,
    todayLessons: 4,
    completedLessons: 124,
    pendingAppointments: 3
  },
  // 学员看到的统计数据
  user: {
    completedCourses: 3,
    scheduledCourses: 2,
    daysToExam: 15,
    learningHours: 24
  }
});

// 根据角色计算显示的卡片数据
const cardDataForRole = computed(() => {
  if (role.value === 'ADMIN') {
    return [
      { title: '学员总数', value: statisticsData.value.admin.studentCount, icon: 'User', type: 'blue-card' },
      { title: '课程总数', value: statisticsData.value.admin.courseCount, icon: 'Document', type: 'green-card' },
      { title: '车辆总数', value: statisticsData.value.admin.vehicleCount, icon: 'Van', type: 'orange-card' },
      { title: '今日课程', value: statisticsData.value.admin.todayLessons, icon: 'Calendar', type: 'purple-card' },
      { title: '待审核预约', value: statisticsData.value.admin.pendingAppointments, icon: 'Warning', type: 'red-card' },
      { title: '新增用户', value: statisticsData.value.admin.newUsers, icon: 'UserFilled', type: 'cyan-card' }
    ];
  } else if (role.value === 'COACH') {
    return [
      { title: '我的学员', value: statisticsData.value.coach.myStudents, icon: 'User', type: 'blue-card' },
      { title: '我的课程', value: statisticsData.value.coach.myCourses, icon: 'Document', type: 'green-card' },
      { title: '今日课程', value: statisticsData.value.coach.todayLessons, icon: 'Calendar', type: 'purple-card' },
      { title: '已完成课时', value: statisticsData.value.coach.completedLessons, icon: 'Check', type: 'cyan-card' },
      { title: '待审核预约', value: statisticsData.value.coach.pendingAppointments, icon: 'Warning', type: 'red-card' }
    ];
  } else { // USER
    return [
      { title: '已完成课程', value: statisticsData.value.user.completedCourses, icon: 'Check', type: 'green-card' },
      { title: '已预约课程', value: statisticsData.value.user.scheduledCourses, icon: 'Calendar', type: 'blue-card' },
      { title: '距离考试', value: statisticsData.value.user.daysToExam, icon: 'Timer', type: 'orange-card' },
      { title: '累计学时', value: statisticsData.value.user.learningHours, icon: 'Van', type: 'purple-card' }
    ];
  }
});

// 系统健康状态
const systemHealth = ref({
  server: true,
  database: true,
  logs: false // 模拟日志模块异常
});

// 管理员快捷操作
const adminQuickActions = ref([
  { name: '添加新用户', icon: 'User', route: '/manager/user/add' },
  { name: '添加新课程', icon: 'Document', route: '/manager/course' },
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
const todayCourses = ref([
  { 
    id: 1, 
    time: '09:00-10:30', 
    courseName: '科目二倒车入库', 
    studentCount: 5, 
    location: '训练场地A区' 
  },
  { 
    id: 2, 
    time: '13:00-14:30', 
    courseName: '科目二侧方停车', 
    studentCount: 3, 
    location: '训练场地B区' 
  },
  { 
    id: 3, 
    time: '15:00-16:30', 
    courseName: '科目三路口转弯', 
    studentCount: 4, 
    location: '城市道路训练区' 
  }
]);

// 教练待审核预约
const pendingAppointments = ref([
  { 
    id: 1, 
    studentName: '张三', 
    courseName: '科目二倒车入库', 
    appointmentTime: '2025-03-15 09:00-10:30' 
  },
  { 
    id: 2, 
    studentName: '李四', 
    courseName: '科目三路口转弯', 
    appointmentTime: '2025-03-16 13:00-14:30' 
  }
]);

// 学员学习进度
const learningProgress = ref([
  { name: '科目一 - 理论考试', percentage: 100, completed: true },
  { name: '科目二 - 场地驾驶', percentage: 75, completed: false },
  { name: '科目三 - 道路驾驶', percentage: 0, completed: false },
  { name: '科目四 - 安全文明', percentage: 0, completed: false }
]);

// 学员推荐课程
const recommendedCourses = ref([]);

// 添加获取推荐课程的方法
const loadRecommendedCourses = async () => {
  try {
    const res = await getCourseList({
      pageNum: 1,
      pageSize: 3,  // 限制只获取3个课程
      title: '',
      type: '',
      // 可以添加排序条件
      sortBy: 'createdTime',
      sortOrder: 'desc'
    });
    
    if (res.code === '200') {
      recommendedCourses.value = (res.data.records || [])
        .filter(course => course.remain > 0)  // 只显示还有剩余名额的课程
        .map(course => ({
          id: course.id,
          name: course.title,
          description: course.description,
          duration: `${course.during || 0}课时`,
          coach: course.coachName,
          type: course.type,
          remain: course.remain,
          startTime: course.startTime,
          image: course.image || `/assets/imgs/course${(course.id % 3) + 1}.jpg`
        }));
      console.log('处理后的推荐课程:', recommendedCourses.value);
    }
  } catch (error) {
    console.error('加载推荐课程失败:', error);
  }
};


// 学员的预约记录
const myAppointments = ref([
  {
    id: 1,
    courseName: '科目二倒车入库训练',
    coach: '王教练',
    appointmentTime: '2025-03-15 09:00-10:30',
    status: '已确认'
  },
  {
    id: 2,
    courseName: '科目二侧方停车训练',
    coach: '王教练',
    appointmentTime: '2025-03-17 13:00-14:30',
    status: '待确认'
  }
]);

// 根据角色返回不同的按钮文本
const carButtonText = computed(() => {
  if (role.value === 'ADMIN') {
    return '进入实时监控看板';
  } else if (role.value === 'COACH') {
    return '进入教学资源中心';
  } else {
    return '进入学习资料中心';
  }
});

// 修改导航方法
const navigateByRole = () => {
  if (!isDragging.value) {  // 确保不是在拖拽状态
    try {
      if (role.value === 'ADMIN') {
        // 使用路由导航而不是直接修改 location
        router.push('/market-analysis/ershouche/index');
        // 或者如果必须使用完整URL：
        // window.open('/market-analysis/ershouche/index.html', '_blank');
      } else if (role.value === 'COACH') {
        router.push('/coach/resources');
      } else {
        router.push('/market-analysis/ershouche/price');
      }
    } catch (error) {
      console.error('导航失败:', error);
      ElMessage.error('页面跳转失败，请稍后重试');
    }
  }
};

// 获取状态标签类型
const getStatusType = (status) => {
  const typeMap = {
    '待确认': 'warning',
    '已确认': 'success',
    '已完成': 'info',
    '已取消': 'danger'
  };
  return typeMap[status] || 'info';
};

// 教练操作方法
const viewAllSchedule = () => {
  router.push('/manager/course-booking');
};

const viewCourseDetail = (course) => {
  router.push(`/manager/course-detail/${course.id}`);
};

const startCourse = (course) => {
  ElMessage.success(`已开始课程：${course.courseName}`);
};

const viewAllPending = () => {
  router.push('/manager/course-appointment');
};

const approveAppointment = (appointment) => {
  ElMessage.success(`已通过 ${appointment.studentName} 的预约申请`);
  // 在实际应用中，这里应该调用API处理预约通过逻辑
};

const rejectAppointment = (appointment) => {
  ElMessage.warning(`已拒绝 ${appointment.studentName} 的预约申请`);
  // 在实际应用中，这里应该调用API处理预约拒绝逻辑
};

// 学员操作方法
const viewAllAppointments = () => {
  router.push('/user/appointments');
};

const viewAppointmentDetail = (appointment) => {
  router.push(`/user/appointment-detail/${appointment.id}`);
};

const cancelAppointment = (appointment) => {
  ElMessageBox.confirm(
    `确定要取消课程 "${appointment.courseName}" 的预约吗？`,
    '取消预约',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('预约已取消');
    // 在实际应用中，这里应该调用API处理取消预约逻辑
  }).catch(() => {});
};

const bookCourse = (course) => {
  router.push(`/user/book-course/${course.id}`);
};

// 管理员操作方法
const handleQuickAction = (route) => {
  router.push(route);
};

const handleAddAnnouncement = () => {
  router.push('/manager/notice');
};

const fixLogsSystem = () => {
  ElMessage.success('已发送修复指令，系统正在处理中...');
  setTimeout(() => {
    systemHealth.value.logs = true;
    ElMessage.success('日志系统已恢复正常');
  }, 2000);
};

// 模拟获取数据
const fetchData = async () => {
  // 在实际应用中，这里应该从API获取真实数据
  // 目前使用模拟数据演示
};

// 在 script setup 中添加拖拽相关的状态和方法
const isDragging = ref(false);
const dragPosition = ref({ x: 50, y: 30 }); // 初始位置
const dragOffset = ref({ x: 0, y: 0 });

// 添加拖拽处理方法
const handleDragStart = (e) => {
  e.preventDefault();
  isDragging.value = true;
  // 记录鼠标按下时的偏移量
  dragOffset.value = {
    x: e.clientX - dragPosition.value.x,
    y: e.clientY - dragPosition.value.y
  };
  // 添加事件监听器
  document.addEventListener('mousemove', handleDragMove);
  document.addEventListener('mouseup', handleDragEnd);
};

const handleDragMove = (e) => {
  if (!isDragging.value) return;
  
  // 计算新位置
  const newX = e.clientX - dragOffset.value.x;
  const newY = e.clientY - dragOffset.value.y;
  
  // 限制边界
  const maxX = window.innerWidth - 150; // 汽车宽度
  const maxY = window.innerHeight - 90; // 汽车高度
  
  dragPosition.value = {
    x: Math.min(Math.max(0, newX), maxX),
    y: Math.min(Math.max(0, newY), maxY)
  };
};

const savePosition = () => {
  localStorage.setItem('floatingCarPosition', JSON.stringify(dragPosition.value));
};

// 在 handleDragEnd 中添加保存
const handleDragEnd = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', handleDragMove);
  document.removeEventListener('mouseup', handleDragEnd);
  savePosition(); // 保存位置
};

onMounted(() => {
  const savedPosition = localStorage.getItem('floatingCarPosition');
  if (savedPosition) {
    dragPosition.value = JSON.parse(savedPosition);
  }
  loadNotices() 
  fetchData();
  loadRecommendedCourses();
});
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

/* 系统监控区域 */
.monitoring-section {
  margin-bottom: 20px;
}

.monitor-card {
  position: relative;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  border-radius: 8px;
}

.monitor-title {
  font-size: 16px;
  margin-bottom: 15px;
  color: #606266;
}

.monitor-value {
  font-size: 24px;
  font-weight: bold;
  color: #f56c6c;
}

.monitor-value.healthy {
  color: #67c23a;
}

.fix-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
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
.schedule-card, .pending-card, .my-appointment-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

/* 学习进度样式 */
.progress-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.progress-container {
  padding: 10px;
}

.progress-item {
  display: flex;
  margin-bottom: 20px;
}

.progress-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 20px;
}

.stage-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f5f7fa;
  color: #909399;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  border: 2px solid #dcdfe6;
}

.stage-icon.completed {
  background-color: #67c23a;
  color: white;
  border-color: #67c23a;
}

.stage-line {
  height: 50px;
  width: 2px;
  background-color: #dcdfe6;
  margin: 5px 0;
}

.stage-info {
  flex: 1;
}

.stage-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.stage-status {
  color: #909399;
  font-size: 12px;
  margin-bottom: 10px;
}

/* 课程推荐样式 */
.recommendation-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.course-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
  transition: all 0.3s;
}

.course-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.course-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.course-info {
  padding: 15px;
}

.course-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.course-desc {
  color: #606266;
  margin-bottom: 10px;
  height: 60px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  color: #909399;
  font-size: 12px;
}

.course-meta .el-icon {
  vertical-align: middle;
  margin-right: 5px;
}

/* 修改悬浮汽车的样式 */
.floating-car {
  width: 150px;
  height: 90px;
  transition: transform 0.3s;
  touch-action: none;
  cursor: pointer;
  
  .car-tooltip {
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    z-index: 1001;
  }

  &:hover:not(.dragging) .car-tooltip {
    opacity: 1;
  }

  .car-shape {
    width: 100%;
    height: 100%;
    cursor: inherit;
    transition: transform 0.3s;

    &:hover {
      transform: scale(1.1);
    }
  }
}

/* 添加拖拽状态类 */
.floating-car.dragging {
  cursor: grabbing;
  
  .car-tooltip {
    opacity: 0;
  }
  
  .car-shape {
    transform: none;
  }
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .data-card, .monitor-card, .action-card {
    height: 100px;
  }
  
  .card-number {
    font-size: 22px;
  }
  
  .floating-car {
    width: 60px;
    height: 60px;
    bottom: 20px;
    right: 20px;
  }
  
  .progress-stage {
    margin-right: 10px;
  }
  
  .stage-icon {
    width: 30px;
    height: 30px;
    font-size: 12px;
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
