<template>
  <div class="captcha-container">
    <div class="captcha-wrapper">
      <canvas ref="canvas" @click="generateCaptcha"></canvas>
      <el-icon class="refresh-icon" @click="generateCaptcha">
        <Refresh />
      </el-icon>
    </div>
    <el-input
      v-model="userInput"
      placeholder="请输入验证码"
      size="large"
      maxlength="4"
      style="margin-top: 10px;"
      @input="handleInput"
    ></el-input>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'

const emit = defineEmits(['update:captcha', 'update:userInput'])

const canvas = ref(null)
const captcha = ref('')
const userInput = ref('')

// 生成随机验证码
const generateCaptcha = () => {
  const ctx = canvas.value.getContext('2d')
  // 设置canvas尺寸
  canvas.value.width = 120
  canvas.value.height = 40
  
  // 生成4位随机验证码
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  captcha.value = result
  // 向父组件发送新生成的验证码
  emit('update:captcha', result)

  // 绘制背景
  ctx.fillStyle = '#f5f7fa'
  ctx.fillRect(0, 0, 120, 40)

  // 绘制文字
  for (let i = 0; i < result.length; i++) {
    ctx.fillStyle = getRandomColor()
    ctx.font = 'bold 24px Arial'
    ctx.textBaseline = 'middle'
    // 随机旋转角度
    const rotate = (Math.random() - 0.5) * 0.3
    ctx.translate(30 * i + 15, 20)
    ctx.rotate(rotate)
    ctx.fillText(result[i], 0, 0)
    ctx.rotate(-rotate)
    ctx.translate(-(30 * i + 15), -20)
  }

  // 绘制干扰线
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = getRandomColor()
    ctx.beginPath()
    ctx.moveTo(Math.random() * 120, Math.random() * 40)
    ctx.lineTo(Math.random() * 120, Math.random() * 40)
    ctx.stroke()
  }

  // 绘制干扰点
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = getRandomColor()
    ctx.beginPath()
    ctx.arc(Math.random() * 120, Math.random() * 40, 1, 0, 2 * Math.PI)
    ctx.fill()
  }
}

// 生成随机颜色
const getRandomColor = () => {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

// 处理用户输入
const handleInput = (value) => {
  emit('update:userInput', value)
}

// 组件挂载时生成验证码
onMounted(() => {
  generateCaptcha()
})

// 添加验证方法
const validateCaptcha = () => {
  return userInput.value === captcha.value
}

// 暴露方法给父组件
defineExpose({
  validateCaptcha,
  userInput,
  captcha
})
</script>

<style scoped>
.captcha-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #dcdfe6;
  padding: 20px;
  border-radius: 5px;
  background-color: #f5f7fa;
}

.captcha-wrapper {
  display: flex;
  align-items: center;
}

canvas {
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 5px;
  background-color: #ffffff;
}

.refresh-icon {
  cursor: pointer;
  margin-left: 10px;
  font-size: 24px;
  color: #409eff;
}
</style>