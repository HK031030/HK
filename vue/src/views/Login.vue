<template>
  <div class="login">
    <video autoplay muted loop class="login-video">
      <source :src="videoSrc" type="video/mp4" />
      
    </video>
    <div class="welcome-text">
      <span class="text-line">欢迎您登录</span>
      <span class="text-line">启航驾校！</span>
    </div>
    <div class="login-form">
      <h3 class="title">驾校管理系统</h3>
      <form @submit.prevent="handleLogin">
        <div class="form-item">
          <el-input
              v-model="username"
              type="text"
              placeholder="用户名"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="form-item">
          <el-input
              v-model="password"
              type="password"
              placeholder="密码"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </div>
        <!-- 角色选择部分 -->
        <div class="form-item">
          <el-select v-model="role" placeholder="选择角色" style="width: 100%">
            <el-option value="USER" label="用户"></el-option>
            <el-option value="ADMIN" label="管理员" :selected="true"></el-option>
            <el-option value="COACH" label="教练" :selected="true"></el-option>
          </el-select>
        </div>

        <!-- 验证码组件 -->
        <div class="form-item">
          <captcha-component ref="captchaRef"/>
        </div>

        <el-button type="primary" style="width:100%;" @click="handleLogin" :loading="loading">
          登录
        </el-button>
        <!-- 添加注册链接 -->
        <div class="register-link" style="display: flex">
          <div style="flex: 1">还没有账号？请 
            <span style="color: #0f9876; cursor: pointer" @click="$router.push('/register')">注册</span>
          </div>
          <div style="flex: 1; text-align: right">
            <span 
              style="color: #0f9876; cursor: pointer" 
              @click="handleForgetPass"
            >忘记密码</span>
          </div>
        </div>
      </form>
    </div>
    <div class="el-login-footer">
      <span>Copyright © 2025 驾校管理系统</span>
    </div>

    <el-dialog title="忘记密码" v-model="forgetPassDialogVis">
      <el-form :model="forgetUserForm" label-width="80px" style="padding-right: 20px">
        <el-form-item label="用户名">
          <el-input v-model="forgetUserForm.username" autocomplete="off" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="forgetUserForm.phone" autocomplete="off" placeholder="请输入手机号"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="forgetPassDialogVis = false">取 消</el-button>
        <el-button type="primary" @click="resetPassword">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
// import { User, Lock } from '@element-plus/icons-vue'
import { login } from '@/api/user'
import CaptchaComponent from './Captcha.vue' // 引入验证码组件


const router = useRouter()
const username = ref('')
const password = ref('')
const role = ref('USER') // 默认角色为
const loading = ref(false)
const forgetPassDialogVis = ref(false)
const forgetUserForm = {}

// 访问验证码组件的方法
const captchaRef = ref(null)

const videoSrc = ref(new URL('../assets/imgs/background.mp4', import.meta.url).href)

// 逐字动画逻辑
onMounted(() => {
  const textLines = document.querySelectorAll('.text-line')
  let totalDelay = 0 // 累计延迟，确保第二行接续第一行

  textLines.forEach((line, lineIndex) => {
    const text = line.textContent
    line.innerHTML = '' // 清空原始文本
    text.split('').forEach((char, charIndex) => {
      const span = document.createElement('span')
      span.textContent = char
      span.className = 'char'
      // 每个字符延迟 0.3 秒，第一行结束后第二行接着开始
      span.style.animationDelay = `${totalDelay + charIndex * 0.3}s`
      line.appendChild(span)
    })
    totalDelay += text.length * 0.3 // 更新总延迟，第一行完成后第二行开始
  })
})

const handleLogin = async () => {
    try {
        if (!username.value || !password.value) {
            ElMessage.error('用户名和密码不能为空')
            return
        }
        const captchaText = captchaRef.value.captcha
        const userInput = captchaRef.value.userInput
        if (!userInput) {
            ElMessage.error('请输入验证码')
            return
        }
        if (userInput.toLowerCase() !== captchaText.toLowerCase()) {
            ElMessage.error('验证码错误，请重试')
            captchaRef.value.generateCaptcha()
            return
        }
        loading.value = true
        const res = await login({
            username: username.value,
            password: password.value,
            role: role.value
        })
        console.log('登录响应:', res)
        if (res.code === '200') {
            // 存储用户信息
            localStorage.setItem('userInfo', JSON.stringify(res.data))
            // 检查 token 是否存在
            const token = res.data.token
            if (!token) {
                ElMessage.error('后端未返回有效的 token')
                return
            }
            localStorage.setItem('token', token)
            console.log('存储的用户信息:', localStorage.getItem('userInfo'))
            console.log('存储的 token:', localStorage.getItem('token'))
            ElMessage.success(res.msg || '登录成功')
            try {
                await router.push({ path: '/manager/home', replace: true })
            } catch (routerError) {
                console.error('路由跳转失败:', routerError)
            }
        } else {
            ElMessage.error(res.msg || '登录失败')
            captchaRef.value?.generateCaptcha()
        }
    } catch (error) {
        console.error('登录失败:', error)
        ElMessage.error('登录失败，请稍后重试')
        captchaRef.value?.generateCaptcha()
    } finally {
        loading.value = false
    }
}

const handleForgetPass = () => {
  router.push('/forgot-password')
}


</script>

<style lang="scss" scoped>
.login {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.login-video {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translate(-50%, -50%);
  object-fit: cover;
  z-index: 1;
}

.welcome-text {
  position: absolute;
  top: 40%;
  left: 10%;
  transform: translateY(-50%);
  z-index: 2;
  color: white;
  font-size: 3rem;
  font-weight: bold;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
}

.text-line {
  display: flex; /* 字符横向排列 */
}

:deep(.char) {
  opacity: 0;
  display: inline-block;
  animation: typeAndFade 8s infinite; /* 组合动画 */
  margin-right: 10px; /* 字符间距 */
  color: #fff; /* 默认颜色 */
  font-size: inherit; /* 保持字体一致 */
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
}
:deep(.char:nth-child(odd)) {
  animation: typeAndFade 8s infinite, wave 2s ease-in-out infinite, pulse 2s infinite; /* 奇数字符加入脉冲效果 */
}

:deep(.char:nth-child(even)) {
  animation: typeAndFade 8s infinite, wave 2s ease-in-out infinite, breathing 2s infinite; /* 偶数字符加入呼吸效果 */
}

@keyframes typeAndFade {
  0% {
    opacity: 0; /* 开始隐藏 */
  }
  10% {
    opacity: 1; /* 快速显现，模拟打字 */
  }
  50% {
    opacity: 1; /* 保持显示直到所有字符打印完 */
  }
  60% {
    opacity: 0; /* 一起淡出 */
  }
  100% {
    opacity: 0; /* 保持隐藏，直到循环开始 */
  }
}
/* 波浪效果 */
@keyframes wave {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0);
  }
}

/* 呼吸效果（颜色渐变） */
@keyframes breathing {
  0% {
    color: #ff7f50;
  }
  50% {
    color: #87cefa;
  }
  100% {
    color: #ff7f50;
  }
}

/* 脉冲效果（颜色渐变） */
@keyframes pulse {
  0% {
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
  }
  50% {
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.5);
  }
  100% {
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
  }
}


.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-form {
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.85);
  width: 400px;
  padding: 25px 25px 5px 25px;
  position: relative;
  z-index: 2;
  margin-right: 10%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);

  .form-item {
    margin-bottom: 20px;
  }

  .el-input {
    height: 38px;
    input {
      height: 38px;
      border-radius: 4px;
    }
  }
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.register-link {
  margin-top: 20px;
  text-align: right;

  span {
    color: #606266;
    font-size: 14px;
  }

  a {
    color: #409EFF;
    text-decoration: none;
    margin-left: 5px;

    &:hover {
      color: #79bbff;
    }
  }
}

.register-link {
  margin-top: 20px;
  text-align: right;

  span {
    &:hover {
      color: #0f9876;
      text-decoration: underline;
    }
  }
}
</style>