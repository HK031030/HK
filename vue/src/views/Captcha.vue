<template>
  <div class="captcha-container">
    <div class="captcha-form">
      <div class="form-item">
        <el-input
          v-model="userInput"
          placeholder="请输入验证码"
          style="width: 240px"
          @input="handleInput"
        >
          <template #append>
            <div class="captcha-display" @click="generateCaptcha">
              {{ captcha }}
            </div>
          </template>
        </el-input>
      </div>
      <div class="captcha-tip" v-if="message">{{ message }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineExpose } from 'vue'
import { Key } from '@element-plus/icons-vue'

const captcha = ref('')
const userInput = ref('')
const message = ref('')

// 生成随机验证码
const generateCaptcha = () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  captcha.value = result
  userInput.value = '' // 重置输入
  message.value = '' // 清空消息
}

// 处理输入
const handleInput = () => {
  message.value = ''
  if (userInput.value.length === 4) {
    if (userInput.value.toLowerCase() === captcha.value.toLowerCase()) {
      message.value = '验证码正确'
    } else {
      message.value = '验证码错误'
      generateCaptcha() // 验证码错误时自动刷新
    }
  }
}

// 组件挂载时生成验证码
onMounted(() => {
  generateCaptcha()
})

// 暴露变量给父组件
defineExpose({
  captcha,
  userInput,
  generateCaptcha
})
</script>

<style lang="scss" scoped>
.captcha-container {
  .captcha-form {
    .form-item {
      margin-bottom: 15px;
      
      :deep(.el-input-group__append) {
        padding: 0;
        overflow: hidden;
      }

      .captcha-display {
        user-select: none;
        cursor: pointer;
        padding: 0 15px;
        height: 38px;
        line-height: 38px;
        font-size: 18px;
        font-weight: bold;
        font-family: 'Arial', sans-serif;
        background: linear-gradient(45deg, #0f9876, #0f6898);
        color: white;
        letter-spacing: 2px;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;

        &:hover {
          background: linear-gradient(45deg, #0f6898, #0f9876);
          transform: scale(1.02);
        }
      }
    }

    .captcha-tip {
      font-size: 12px;
      color: #67c23a;

      &.error {
        color: #f56c6c;
      }
    }
  }
}
</style>