<template>
  <div class="home-container">
    <FloatingParticles />
    <!-- 3D 轮播图 -->
    <div class="banner-container">
      <div class="light-effects"></div>
      <el-carousel 
        :interval="5000" 
        type="card" 
        height="75vh"
        :autoplay="!isHovering"
        @mouseenter="isHovering = true"
        @mouseleave="isHovering = false"
      >
        <el-carousel-item 
          v-for="item in bannerList" 
          :key="item.id"
          class="carousel-item"
        >
        <div class="banner-item" 
          :style="{ backgroundImage: `url(${item.image})` }"
          @click="handleAreaClick(item)"
          @mouseenter="showTooltip(item.title)"
          @mouseleave="hideTooltip"
        >

            <div class="banner-overlay"></div>
          </div>
        </el-carousel-item>
      </el-carousel>

      <!-- 修改欢迎语部分 -->
      <div class="welcome-layer">
        <h1 class="welcome-title">
          <span class="text-mask" data-text="欢迎您注册">Welcome to</span>
          <span class="school-name">启航驾校</span>
        </h1>
        <div class="welcome-subtitle">
          <transition-group name="line">
            <div 
              v-for="(line, index) in animatedLines" 
              :key="index"
              class="line-wrapper"
              :class="{ 'is-visible': line.isVisible }"
            >
              <span class="animated-line">
                {{ line.text }}
              </span>
            </div>
          </transition-group>
        </div>
      </div>

      <!-- 登录/注册按钮重塑 -->
      <div class="auth-buttons">
        <button 
          class="hud-btn login-btn"
          @mouseenter="playHoverSound"
          @click="router.push('/login')"
        >
          <span class="hologram-text">登录</span>
          <div class="energy-pulse"></div>
        </button>
        
        <button 
          class="hud-btn register-btn"
          @mouseenter="playHoverSound"
          @click="router.push('/register')"
        >
          <span class="hologram-text">注册</span>
          <div class="energy-pulse"></div>
        </button>
      </div>
    </div>

    <!-- 替换统计数据和新闻滚动 -->
    <div class="call-to-action">
      <div class="action-item">
        <h3 class="action-title">立即预约免费试听</h3>
        <p class="action-desc">专业教练，个性化教学，助您轻松拿证</p>
        <el-button type="success" @click="router.push('/register')">立即预约</el-button>
      </div>
      <div class="action-item">
        <h3 class="action-title">查看最新优惠活动</h3>
        <p class="action-desc">报名即享多重惊喜，学车更划算</p>
        <el-button type="warning">了解详情</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import FloatingParticles from './FloatingParticles.vue'
import banner1 from '@/assets/imgs/banner1.jpg'
import banner2 from '@/assets/imgs/banner2.jpg'
import banner3 from '@/assets/imgs/banner3.jpg'

const bannerList = ref([
  {
    id: 1,
    title: '智能驾驶培训基地',
    description: '5000平米专业训练场地，配备智能模拟系统',
    image: banner1,
    tags: ['智能模拟', 'VR体验', '场地充足'],
    interactiveAreas: [
      { x: 30, y: 40, tooltip: '点击体验VR模拟器', type: 'simulator' },
      { x: 70, y: 60, tooltip: '查看场地介绍', type: 'field' }
    ]
  },
  {
    id: 2,
    title: '专业教练团队',
    description: '金牌教练一对一指导，确保学习效果',
    image: banner2,
    tags: ['经验丰富', '耐心细致', '优质服务'],
    interactiveAreas: [
      { x: 45, y: 50, tooltip: '预约教练', type: 'coach' }
    ]
  },
  {
    id: 3,
    title: '智能预约系统',
    description: 'AI智能排课，灵活安排训练时间',
    image: banner3,
    tags: ['智能排课', '在线预约', '进度可控'],
    interactiveAreas: [
      { x: 60, y: 45, tooltip: '立即预约', type: 'booking' }
    ]
  }
])

const isHovering = ref(false)
const router = useRouter()

const handleAreaClick = (item) => {
  ElMessageBox.confirm(
    '立即注册体验智能驾校系统？',
    '温馨提示',
    {
      confirmButtonText: '立即注册',
      cancelButtonText: '稍后再说',
      type: 'info'
    }
  ).then(() => {
    router.push('/register')
  }).catch(() => {})
}

// 欢迎语改造
const playHoverSound = () => {
  // 播放引擎启动音效
}

// 欢迎语数据和控制变量
const welcomeLines = [
  '扭动钥匙',
  '拉起手刹',
  '踩下油门',
  '你就可以去你想去的任何地方',
  '是，我们都会去往我们想去的任何地方'
]

const isAnimating = ref(false)
const animatedLines = ref([])

// 动画初始化
onMounted(() => {
  initializeAnimations()
})

const initializeAnimations = () => {
  // 初始化动画状态
  resetLines()
  startTyping()
}

const resetLines = () => {
  animatedLines.value = welcomeLines.map((line, index) => ({
    text: '',
    fullText: line,
    isVisible: false,
    delay: index * 500
  }))
}

const startTyping = () => {
  let currentLineIndex = 0
  
  const typeLine = () => {
    if (currentLineIndex >= welcomeLines.length) {
      // 所有行都完成后，等待一段时间后重新开始
      setTimeout(() => {
        resetLines()
        currentLineIndex = 0
        typeLine()
      }, 3000) // 等待3秒后重新开始
      return
    }

    let charIndex = 0
    const line = animatedLines.value[currentLineIndex]
    const intervalId = setInterval(() => {
      if (charIndex < line.fullText.length) {
        line.text += line.fullText[charIndex]
        charIndex++
      } else {
        clearInterval(intervalId)
        line.isVisible = true
        currentLineIndex++
        // 开始下一行
        setTimeout(typeLine, 500)
      }
    }, 100)
  }

  typeLine()
}

// 在组件卸载时清理
onUnmounted(() => {
  // 如果需要，这里可以添加清理代码
})
</script>

<style lang="scss" scoped>
.home-container {
  position: relative;
  overflow: hidden;
  background: url('@/assets/imgs/bg.jpg') center/cover no-repeat; /* 替换背景 */
  color: #fff;
}

.banner-container {
  position: relative;
  height: 75vh;
  overflow: hidden;

  .light-effects {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    background: 
      radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 25%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 25%);
    animation: lightMove 10s ease-in-out infinite alternate;
  }
}

.carousel-item {
  transform-style: preserve-3d;
  transition: transform 0.5s ease-out;
  
  &:hover {
    transform: scale(1.02) translateZ(20px);
  }
}

.banner-item {
  position: relative;
  height: 100%;
  background-size: cover;
  background-position: center;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0.4) 50%,
      rgba(0, 0, 0, 0.7) 100%
    );
    opacity: 1;
    transition: opacity 0.3s;
  }
  
  &:hover::before {
    opacity: 1;
  }
}

/* 欢迎语改造 */
.welcome-layer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
  width: 100%;
  max-width: 780px;
  padding: 1rem;
}

.welcome-title {
  margin-bottom: 1.5rem;
  perspective: 1000px;
  
  .text-mask {
    display: block;
    font-size: 2.5rem;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    letter-spacing: 0.1em;
  }
  
  .school-name {
    display: block;
    font-size: 4rem;
    font-weight: 700;
    margin-top: 0.5rem; // 减小标题间距
    color: #fff;
    letter-spacing: 0.2em;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
}

.welcome-subtitle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
}

.line-wrapper {
  overflow: hidden;
  margin-bottom: 0.5rem;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 0.5s ease-out forwards;
  animation-delay: calc(var(--index, 0) * 0.5s);
  
  .animated-line {
    display: inline-block;
    font-family: 'Consolas', monospace;
    font-size: 1.6rem;
    color: rgba(255, 255, 255, 0.9);
    position: relative;
   
  }
}


/* 移除之前的彩色样式 */
.line-wrapper {
  &:nth-child(1),
  &:nth-child(2),
  &:nth-child(3),
  &:nth-child(4),
  &:nth-child(5) {
    .animated-line {
      color: rgba(255, 255, 255, 0.9);
      font-weight: normal;
      font-style: normal;
    }
  }
}

/* 为每一行添加特殊效果 */
.animated-line {
  /* 添加打字机风格的字体和间距 */
  letter-spacing: 0.1em;
  white-space: pre;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &:hover::before {
    transform: scaleX(1);
  }
}

/* 添加模糊阴影效果 */
.welcome-layer::before {
  content: '';
  position: absolute;
  inset: -20px;
  background: radial-gradient(
    circle at center,
    rgba(0, 0, 0, 0.3),
    transparent 70%
  );
  filter: blur(10px);
  z-index: -1;
}

/* 登录/注册按钮重塑 */
.auth-buttons {
  position: absolute;
  bottom: 5%;
  left: 50%; /* 居中 */
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  z-index: 10;
}

.hud-btn {
  position: relative;
  padding: 12px 24px;
  border: none;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(12px);
  border-radius: 4px;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  cursor: pointer;
  
  &::before { /* 边框光带 */
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 4px;
    padding: 1px;
    background: linear-gradient(45deg, 
      rgba(0,255,135,0.6) 0%,
      rgba(96,239,255,0.6) 100%
    );
    -webkit-mask: 
      linear-gradient(#000 0 0) content-box, 
      linear-gradient(#000 0 0);
    mask-composite: exclude;
  }
  
  .hologram-text {
    color: #00ff87;
    text-shadow: 0 0 8px rgba(0,255,135,0.4);
    font-weight: 700;
    letter-spacing: 1px;
  }
  
  .energy-pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: radial-gradient(circle, 
      rgba(0,255,135,0.4) 0%, 
      transparent 70%
    );
    transform: translate(-50%, -50%);
    transition: width 0.3s, height 0.3s;
  }
  
  &:hover {
    transform: translateY(-2px);
    
    .energy-pulse {
      width: 120%;
      height: 120%;
    }
    
    &::before {
      background: linear-gradient(45deg, 
        rgba(0,255,135,0.8) 0%,
        rgba(96,239,255,0.8) 100%
      );
    }
  }
}

.call-to-action {
  display: flex;
  justify-content: space-around;
  padding: 50px 0;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  margin-top: 30px;
  
  .action-item {
    text-align: center;
    
    .action-title {
      font-size: 1.8rem;
      margin-bottom: 10px;
    }
    
    .action-desc {
      font-size: 1.1rem;
      color: #ddd;
      margin-bottom: 20px;
    }
  }
}

@keyframes lightMove {
  0% {
    transform: translateX(-10%) translateY(-10%);
  }
  100% {
    transform: translateX(10%) translateY(10%);
  }
}

@keyframes dissolve {
  0% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
  25% { clip-path: polygon(0 0, 75% 0, 100% 100%, 0 100%); }
  50% { clip-path: polygon(0 0, 50% 0, 100% 100%, 0 100%); }
  75% { clip-path: polygon(0 0, 25% 0, 100% 100%, 0 100%); }
  100% { clip-path: polygon(0 0, 0 0, 100% 100%, 0 100%); }
}

@keyframes glitch-text {
  0% { transform: translateX(0); }
  25% { transform: translateX(5px); }
  50% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
  100% { transform: translateX(0); }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes titleFloat {
  0%, 100% {
    transform: translateZ(0);
  }
  50% {
    transform: translateZ(50px);
  }
}

@keyframes schoolNameFloat {
  0% {
    transform: translateZ(0) rotateX(0);
  }
  100% {
    transform: translateZ(80px) rotateX(10deg);
  }
}

@keyframes lineSlideUp {
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 添加新的动画效果 */
.line-enter-active,
.line-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.line-enter-from,
.line-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 优化移动端显示 */
@media screen and (max-width: 768px) {
  .welcome-title {
    .text-mask {
      font-size: 2rem;
    }
    
    .school-name {
      font-size: 3rem;
    }
  }
  
  .animated-line {
    font-size: 1.4rem;
  }
  
  .line-wrapper {
    margin-bottom: 0.8rem;
  }
}
</style>