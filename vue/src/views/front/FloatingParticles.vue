<template>
  <canvas 
    ref="particleCanvas" 
    class="floating-particles-canvas"
  ></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

class Particle {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.reset()
  }

  reset() {
    this.x = Math.random() * this.canvas.width
    this.y = Math.random() * this.canvas.height
    this.radius = Math.random() * 2 + 1
    this.speedX = (Math.random() - 0.5) * 0.5
    this.speedY = (Math.random() - 0.5) * 0.5
    
    // 定义更多颜色变化
    this.color = this.generateColor()
    this.opacity = Math.random() * 0.3 + 0.1
  }

  generateColor() {
    const colors = [
      'rgba(0, 255, 135, 0.2)',   // 绿色
      'rgba(96, 239, 255, 0.2)',  // 青色
      'rgba(255, 100, 200, 0.1)' // 粉色
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  update() {
    this.x += this.speedX
    this.y += this.speedY

    // 边界处理
    if (this.x < 0) this.x = this.canvas.width
    if (this.x > this.canvas.width) this.x = 0
    if (this.y < 0) this.y = this.canvas.height
    if (this.y > this.canvas.height) this.y = 0
  }

  draw() {
    const ctx = this.ctx
    
    // 创建径向渐变
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0, 
      this.x, this.y, this.radius * 3
    )
    gradient.addColorStop(0, this.color)
    gradient.addColorStop(1, 'transparent')

    ctx.beginPath()
    ctx.globalAlpha = this.opacity
    ctx.fillStyle = gradient
    ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.closePath()
  }
}

const particleCanvas = ref(null)
const particles = ref([])
let animationFrame = null

onMounted(() => {
  const canvas = particleCanvas.value
  const ctx = canvas.getContext('2d')

  // 设置画布大小
  function resizeCanvas() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  // 初始化粒子
  function initParticles() {
    // 根据屏幕大小调整粒子数量
    const particleCount = window.innerWidth < 768 ? 50 : 100
    
    // 清空之前的粒子
    particles.value = []
    
    // 创建新粒子
    for (let i = 0; i < particleCount; i++) {
      particles.value.push(new Particle(canvas))
    }
  }

  // 动画循环
  function animate() {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 更新和绘制粒子
    particles.value.forEach(particle => {
      particle.update()
      particle.draw()
    })

    // 继续动画
    animationFrame = requestAnimationFrame(animate)
  }

  // 初始化
  resizeCanvas()
  initParticles()
  animate()

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    resizeCanvas()
    initParticles()
  })

  // 清理函数
  onUnmounted(() => {
    cancelAnimationFrame(animationFrame)
    window.removeEventListener('resize', resizeCanvas)
  })
})
</script>

<style scoped>
.floating-particles-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1; /* 确保在内容之下 */
  opacity: 0.3; /* 轻微透明 */
  mix-blend-mode: soft-light; /* 柔和混合 */
}
</style>