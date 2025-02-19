<template>
  <div class="captcha-container">
    <div class="captcha-display" @click="generateCaptcha" style="cursor: pointer;">
      {{ captcha }}
    </div>
    <el-input
        v-model="userInput"
        placeholder="请输入验证码"
        size="large"
        style="margin-top: 10px;"
    ></el-input>
    <div v-if="message" class="captcha-message">{{ message }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const captcha = ref('')
const userInput = ref('')
const message = ref('')

// 生成随机验证码
const generateCaptcha = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  captcha.value = result
  message.value = '' // 清空消息提示
}

// 组件挂载时生成验证码
onMounted(() => {
  generateCaptcha()
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

.captcha-display {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 5px;
}

.captcha-message {
  margin-top: 10px;
  color: #f56c6c; /* 红色 */
}
</style>