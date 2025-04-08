<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <div class="header-left">
        <nav class="navigation">
          <ul>
            <li class="active">
              <a href="#" class="nav-link">
                <i class="icon-monitor"></i>
                <span>实时监控</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div class="header-right">
        <el-button 
          type="primary" 
          class="return-button"
          @click="handleExit"
        >
          <el-icon><Back /></el-icon>
          返回主页
        </el-button>
      </div>
    </header>

    <!-- Main Content Grid -->
    <main class="dashboard-grid">
      <!-- Left Panel: Workload and Trend -->
      <section class="panel left-panel">
        <div class="panel-section workload-section">
          <h2 class="panel-title">教练学员人数</h2>
          <div class="panel-content">
            <CoachWorkload />
          </div>
        </div>
        
        <div class="panel-section trend-section">
          <h2 class="panel-title">预约趋势</h2>
          <div class="panel-content">
            <TrendChart />
          </div>
        </div>
      </section>

      <!-- Center Panel: Statistics and Heatmap -->
      <section class="panel center-panel">
        <div class="statistics-container">
          <StatisticsPanel />
        </div>
        
        <div class="heatmap-section">
          <h2 class="panel-title">用户周活</h2>
          <div class="panel-content">
            <HeatMap />
          </div>
        </div>
      </section>

      <!-- Right Panel: Course Types and Hot Coaches -->
      <section class="panel right-panel">
        <div class="panel-section course-type-section">
          <h2 class="panel-title">已预约课程占比</h2>
          <div class="panel-content">
            <CourseTypePie />
          </div>
        </div>

        <div class="panel-section hot-coaches-section">
          <h2 class="panel-title">留言区</h2>
          <div class="panel-content">
            <HotCoachCloud />
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import StatisticsPanel from './components/StatisticsPanel.vue'
import CoachWorkload from './components/CoachWorkload.vue'
import TrendChart from './components/TrendChart.vue'
import CourseTypePie from './components/CourseTypePie.vue'
import HotCoachCloud from './components/HotCoachCloud.vue'
import HeatMap from './components/HeatMap.vue'

const router = useRouter()
const appStore = useAppStore()

const charts = ref([])
const isFullscreen = ref(false)

const registerChart = (chart) => {
  if (chart) {
    charts.value.push(chart)
  }
}

const handleExit = () => {
  // Dispose charts
  charts.value.forEach(chart => {
    if (chart && !chart.isDisposed()) {
      chart.dispose()
    }
  })
  charts.value = []

  // Exit fullscreen if active
  if (isFullscreen.value) {
    exitFullscreen()
  }

  // Navigate back
  router.push('/manager/home')
}

// Cross-browser fullscreen methods
const requestFullscreen = () => {
  const docElm = document.documentElement
  if (docElm.requestFullscreen) {
    docElm.requestFullscreen()
  } else if (docElm.mozRequestFullScreen) { // Firefox
    docElm.mozRequestFullScreen()
  } else if (docElm.webkitRequestFullScreen) { // Chrome, Safari and Opera
    docElm.webkitRequestFullScreen()
  } else if (docElm.msRequestFullscreen) { // IE/Edge
    docElm.msRequestFullscreen()
  }
}

const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.mozCancelFullScreen) { // Firefox
    document.mozCancelFullScreen()
  } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
    document.webkitExitFullscreen()
  } else if (document.msExitFullscreen) { // IE/Edge
    document.msExitFullscreen()
  }
}

// Fullscreen change event handler
const handleFullscreenChange = () => {
  isFullscreen.value = !!(
    document.fullscreenElement || 
    document.mozFullScreenElement || 
    document.webkitFullscreenElement || 
    document.msFullscreenElement
  )
}

onMounted(() => {
  // Hide overall layout
  appStore.setShowLayout(false)
  
  // Try to enter fullscreen with error handling
  try {
    requestFullscreen()
  } catch (err) {
    console.warn('Fullscreen mode not available:', err)
  }
  
  // Add monitor mode class
  document.querySelector('.manager-container')?.classList.add('monitor-mode')
  
  // Add resize and fullscreen change listeners
  window.addEventListener('resize', handleResize)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('mozfullscreenchange', handleFullscreenChange)
  document.addEventListener('MSFullscreenChange', handleFullscreenChange)
})

const handleResize = () => {
  charts.value.forEach(chart => {
    if (chart && !chart.isDisposed()) {
      chart.resize()
    }
  })
}

onBeforeUnmount(() => {
  // Restore layout
  appStore.setShowLayout(true)
  
  // Exit fullscreen
  if (isFullscreen.value) {
    exitFullscreen()
  }
  
  // Remove monitor mode class
  document.querySelector('.manager-container')?.classList.remove('monitor-mode')
  
  // Remove event listeners
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
  document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
  
  // Dispose charts
  charts.value.forEach(chart => {
    if (chart && !chart.isDisposed()) {
      chart.dispose()
    }
  })
  charts.value = []
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #0c1f56 0%, #12345a 100%);
  
  // 头部样式优化
  .dashboard-header {
    height: 60px;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(12, 31, 86, 0.5);
    backdrop-filter: blur(10px);
    
    .navigation ul {
      display: flex;
      gap: 20px;
      
      li.active {
        padding: 8px 16px;
        background: rgba(0, 255, 227, 0.1);
        border-radius: 4px;
        
        .nav-link {
          color: #00FFE3;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }
    }
    
    .return-button {
      height: 36px;
      padding: 0 20px;
    }
  }
  
  // 主体内容区域
  .dashboard-grid {
    height: calc(100vh - 60px);
    padding: 20px;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 400px 1fr 425px;
    gap: 20px;
    
    .panel {
      background: rgba(12, 31, 86, 0.7);
      border-radius: 8px;
      overflow: hidden;
      
      .panel-title {
        height: 50px;
        padding: 0 20px;
        display: flex;
        align-items: center;
        font-size: 15px;
        color: #fff;
        border-bottom: 1px solid rgba(0, 255, 227, 0.1);
        
        &::before {
          content: '';
          width: 3px;
          height: 16px;
          background: #00FFE3;
          margin-right: 8px;
        }
      }
      
      .panel-content {
        height: calc(100% - 50px);
        padding: 20px;
      }
    }
    
    // 左侧面板
    .left-panel {
      display: flex;
      flex-direction: column;
      gap: 20px;
      
      .workload-section {
        height: calc(50% - 10px);
      }
      
      .trend-section {
        height: calc(50% - 10px);
      }
    }
    
    // 中间面板
    .center-panel {
      .statistics-container {
        height: 160px;
        margin-bottom: 20px;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
      }
      
      .heatmap-section {
        height: calc(100% - 180px);
      }
    }
    
    // 右侧面板
    .right-panel {
      display: flex;
      flex-direction: column;
      gap: 20px;
      
      .course-type-section,
      .hot-coaches-section {
        height: calc(50% - 10px);
      }
    }
  }
}

// 图表容器样式
:deep(.chart-container) {
  width: 100%;
  height: 100%;
}

// 优化统计卡片样式
:deep(.statistics-card) {
  height: 160px;
  padding: 25px;
  background: rgba(12, 31, 86, 0.7);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
// 响应式处理时也要调整高度
@media screen and (max-width: 1600px) {
  .dashboard-grid {
    grid-template-columns: 300px 1fr 300px;
    
    .center-panel {
      .statistics-container {
        height: 140px; // 小屏幕时适当减小高度
      }
      
      .heatmap-section {
        height: calc(100% - 160px);
      }
    }
    
    :deep(.statistics-card) {
      height: 140px;
      padding: 20px;
    }
  }
}
// 响应式处理
@media screen and (max-width: 1920px) {
  .dashboard-grid {
    grid-template-columns: 350px 1fr 350px;
  }
}

@media screen and (max-width: 1600px) {
  .dashboard-grid {
    grid-template-columns: 300px 1fr 300px;
  }
}
</style>