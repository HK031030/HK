<template>
  <div 
    class="floating-car" 
    @mousedown.prevent="handleDragStart"
    :style="{
      position: 'fixed',
      left: `${dragPosition.x}px`,
      top: `${dragPosition.y}px`,
      cursor: isDragging ? 'grabbing' : 'grab',
      userSelect: 'none',
      zIndex: isDragging ? 1000 : 999
    }"
    :class="{ 'dragging': isDragging }"
  >
    <!-- 修改这里的点击事件绑定 -->
    <img 
      src="/assets/realistic-car.svg" 
      class="car-shape" 
      draggable="false"
      @click="handleClick"
    />
    <div 
      class="car-tooltip" 
      :style="{ 
        zIndex: 1001,
        opacity: isDragging ? 0 : undefined 
      }"
    >
      {{buttonText}}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const props = defineProps({
  role: {
    type: String,
    required: true
  }
})

const router = useRouter()
const isDragging = ref(false)
const dragPosition = ref({ x: 50, y: 30 })
const dragOffset = ref({ x: 0, y: 0 })

// 按钮文本
const buttonText = computed(() => {
  if (props.role === 'ADMIN') {
    return '进入实时监控看板'
  } else if (props.role === 'COACH') {
    return '进入教学资源中心'
  } else {
    return '进入学习资料中心'
  }
})

// 修改导航方法
// const handleClick = () => {
//   // 只有在不拖拽时才能点击
//   if (!isDragging.value) {
//     try {
//       const baseUrl = 'http://localhost:5173' // 根据实际部署地址修改
//       if (props.role === 'ADMIN') {
//         window.location.href = `${baseUrl}/market-analysis/ershouche/index.html`
//       } else if (props.role === 'COACH') {
//         window.location.href = `${baseUrl}/coach/resources`
//       } else {
//         window.location.href = `${baseUrl}/market-analysis/ershouche/price.html`
//       }
//     } catch (error) {
//       console.error('导航失败:', error)
//       ElMessage.error('页面跳转失败，请稍后重试')
//     }
//   }
// }

const handleClick = () => {
  if (!isDragging.value) {
    try {
      if (props.role === 'ADMIN') {
        router.push('/monitor').catch(err => {
          console.error('路由跳转失败:', err)
          ElMessage.error('页面跳转失败，请检查路由配置')
        })
      } else if (props.role === 'COACH') {
        router.push('/manager/coach/resources')
      } else {
        // 修改用户跳转路径
        router.push('/manager/materials').catch(err => {
          console.error('路由跳转失败:', err)
          ElMessage.error('页面跳转失败，请检查路由配置')
        })
      }
    } catch (error) {
      console.error('导航失败:', error)
      ElMessage.error('页面跳转失败，请稍后重试')
    }
  }
}
// 拖拽相关方法
const handleDragStart = (e) => {
  e.preventDefault()
  isDragging.value = true
  dragOffset.value = {
    x: e.clientX - dragPosition.value.x,
    y: e.clientY - dragPosition.value.y
  }
  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)
}

const handleDragMove = (e) => {
  if (!isDragging.value) return
  
  const newX = e.clientX - dragOffset.value.x
  const newY = e.clientY - dragOffset.value.y
  
  const maxX = window.innerWidth - 150
  const maxY = window.innerHeight - 90
  
  dragPosition.value = {
    x: Math.min(Math.max(0, newX), maxX),
    y: Math.min(Math.max(0, newY), maxY)
  }
}

const handleDragEnd = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
  savePosition()
}

// 位置存储相关方法
const savePosition = () => {
  localStorage.setItem('floatingCarPosition', JSON.stringify(dragPosition.value))
}

const loadSavedPosition = () => {
  const saved = localStorage.getItem('floatingCarPosition')
  if (saved) {
    dragPosition.value = JSON.parse(saved)
  }
}

onMounted(() => {
  loadSavedPosition()
  window.addEventListener('resize', handleResize)
})

const handleResize = () => {
  const maxX = window.innerWidth - 150
  const maxY = window.innerHeight - 90
  dragPosition.value = {
    x: Math.min(dragPosition.value.x, maxX),
    y: Math.min(dragPosition.value.y, maxY)
  }
  savePosition()
}
</script>

<style lang="scss" scoped>
.floating-car {
  width: 150px;
  height: 90px;
  transition: transform 0.3s;
  touch-action: none;
  cursor: pointer;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -100px;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 60px;
    background: linear-gradient(
      to top,
      rgba(64, 158, 255, 0.8),
      rgba(64, 158, 255, 0)
    );
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }
  
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
    box-shadow: 0 0 15px rgba(64, 158, 255, 0.3);
    
    &::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 6px 6px 0;
      border-style: solid;
      border-color: rgba(0, 0, 0, 0.8) transparent transparent;
    }
  }

  &:hover:not(.dragging) {
    .car-tooltip {
      opacity: 1;
    }
    
    &::before {
      opacity: 1;
      animation: beam-pulse 2s infinite;
    }
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

  &.dragging {
    cursor: grabbing;
    
    .car-tooltip {
      opacity: 0;
    }
    
    &::before {
      opacity: 0;
    }
    
    .car-shape {
      transform: none;
    }
  }
}

@keyframes beam-pulse {
  0% {
    opacity: 0.2;
    height: 60px;
  }
  50% {
    opacity: 0.8;
    height: 80px;
  }
  100% {
    opacity: 0.2;
    height: 60px;
  }
}
</style>