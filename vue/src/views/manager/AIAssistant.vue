<!-- @/views/manager/AIAssistant.vue -->
<template>
  <div class="ai-assistant-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>智能助手</h1>
      <p>与 AI 互动，获取帮助和信息</p>
    </div>

    <!-- 页面内容 -->
    <div class="page-content">
      <div class="welcome-section">
        <h2>欢迎使用智能助手</h2>
        <p>你可以在这里提问任何问题，AI 将尽力为你解答。试试以下功能：</p>
        <div class="feature-cards">
          <div class="feature-card" @click="selectSuggestion('如何使用系统的主要功能？')">
            <div class="card-icon">
              <el-icon><HomeFilled /></el-icon>
            </div>
            <h3>系统功能</h3>
            <p>了解系统的主要功能和使用方法</p>
          </div>
          <div class="feature-card" @click="selectSuggestion('给我一些驾考学习建议')">
            <div class="card-icon">
              <el-icon><Reading /></el-icon>
            </div>
            <h3>学习建议</h3>
            <p>获取个性化的学习计划和资源推荐</p>
          </div>
          <div class="feature-card" @click="selectSuggestion('解答一个常见问题')">
            <div class="card-icon">
              <el-icon><QuestionFilled /></el-icon>
            </div>
            <h3>日常问答</h3>
            <p>解答你驾考中遇到的各种问题</p>
          </div>
        </div>
      </div>
    </div>

    <!-- AI 助手悬浮触发器 -->
    <div class="ai-assistant-container">
      <div class="ai-assistant-trigger" @click="toggleAssistant" :class="{ 'pulse': unreadMessages > 0 }">
        <svg-icon name="ai-icon" class="ai-icon" />
        <span class="ai-badge" v-if="unreadMessages">{{ unreadMessages }}</span>
      </div>

      <transition name="slide-up">
        <div v-if="isAssistantVisible" class="ai-assistant-modal" @click.stop>
          <div class="ai-header">
            <div class="header-title">
              <svg-icon name="ai-logo" class="ai-logo" />
              <h3>日常 AI 助手</h3>
            </div>
            <div class="header-actions">
              <button @click="clearConversation" title="清空对话" class="header-btn">
                <svg-icon name="delete-icon" />
              </button>
              <button @click="toggleSettings" title="设置" class="header-btn">
                <svg-icon name="settings-icon" />
              </button>
              <button @click="closeAssistant" title="关闭" class="header-btn">
                <svg-icon name="close-icon" />
              </button>
            </div>
          </div>

          <div v-if="showSettings" class="settings-panel">
            <div class="settings-header">
              <h4>设置</h4>
              <button @click="toggleSettings" class="close-settings">
                <svg-icon name="close-icon" />
              </button>
            </div>
            <div class="settings-content">
              <div class="setting-item">
                <span>自动回复</span>
                <label class="switch">
                  <input type="checkbox" v-model="settings.autoReply">
                  <span class="slider round"></span>
                </label>
              </div>
              <div class="setting-item">
                <span>声音提醒</span>
                <label class="switch">
                  <input type="checkbox" v-model="settings.soundNotification">
                  <span class="slider round"></span>
                </label>
              </div>
              <div class="setting-item">
                <span>AI 模型</span>
                <select v-model="settings.model" class="model-select">
                  <option value="spark">讯飞星火</option>
                  <option value="spark-v2">星火V2.0</option>
                  <option value="spark-v3">星火V3.0</option>
                </select>
              </div>
            </div>
          </div>

          <div ref="conversationContainer" class="ai-conversation-container">
            <div v-if="messages.length === 0" class="welcome-message">
              <div class="ai-avatar">AI</div>
              <div class="welcome-content">
                <h4>你好！我是你的日常 AI 助手</h4>
                <p>请问有什么我可以帮你的吗？你可以尝试以下问题：</p>
                <div class="suggestion-chips">
                  <div class="suggestion-chip" @click="selectSuggestion('如何预约课程')">
                    如何预约课程
                  </div>
                  <div class="suggestion-chip" @click="selectSuggestion('如何使用系统的学习资料？')">
                    如何使用系统的学习资料？
                  </div>
                  <div class="suggestion-chip" @click="selectSuggestion('帮我生成一个驾考满分计划')">
                    帮我生成一个驾考满分计划
                  </div>
                </div>
              </div>
            </div>
            <div
              v-for="(message, index) in messages"
              :key="index"
              class="message"
              :class="{ 'user-message': message.role === 'user', 'ai-message': message.role === 'assistant' }"
            >
              <div class="message-avatar">
                <span v-if="message.role === 'user'">你</span>
                <span v-else>AI</span>
              </div>
              <div class="message-content">
                <div class="content-text" v-html="formatMessage(message.content)"></div>
                <div class="message-meta">
                <span v-if="message.source === 'faq'" class="source-badge">FAQ</span>
                <div class="message-time">{{ formatTime(message.timestamp || Date.now()) }}</div>
              </div>
              </div>
            </div>
            <div v-if="isLoading" class="ai-typing">
              <div class="ai-avatar">AI</div>
              <div class="typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
              </div>
            </div>
          </div>

          <div class="ai-input-container">
            <div class="input-tools">
              <button class="tool-button" title="上传图片">
                <svg-icon name="image-icon" />
              </button>
              <button class="tool-button" title="语音输入">
                <svg-icon name="mic-icon" />
              </button>
            </div>
            <div class="input-wrapper">
              <textarea
                v-model="userInput"
                @keyup.enter.exact.prevent="sendMessage"
                @keydown.enter.shift.exact="newLine"
                placeholder="输入你的问题或消息..."
                rows="1"
                ref="messageInput"
                @input="adjustTextareaHeight"
              ></textarea>
              <button @click="sendMessage" :disabled="!userInput.trim() || isLoading" class="send-button">
                <svg-icon name="send-icon" />
              </button>
            </div>
            <div class="input-hint">按 Enter 发送，Shift+Enter 换行</div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, computed } from 'vue';
import { useWebSocket } from '@/hooks/useWebSocket';
import { getSparkAccessToken } from '@/api/aiAssistant';

import axios from 'axios'; 

const isAssistantVisible = ref(false);
const userInput = ref('');
const messages = ref([]);
const isLoading = ref(false);
const unreadMessages = ref(0);
const lastReadIndex = ref(-1);
const conversationContainer = ref(null);
const messageInput = ref(null);
const showSettings = ref(false);
const settings = ref({
  autoReply: true,
  soundNotification: false,
  model: 'spark-v4' // 更新为 v4.0 对应的默认模型
});

// WebSocket 配置
const { sendMessage: sendWebSocketMessage, isConnected, reconnect, connect } = useWebSocket({
  url: computed(() => `wss://spark-api.xf-yun.com/v4.0/chat`),
  onMessage: handleAIResponse,
  onError: (error) => handleError(error, 'WebSocket 错误'),
  onClose: () => console.log('WebSocket 连接已关闭'),
});

function formatMessage(content) {
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  return content.replace(linkRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
               .replace(/\n/g, '<br>');
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

// 添加 FAQ 搜索函数
async function searchFAQ(keyword) {
  console.log('正在搜索FAQ:', keyword);
  try {
    const response = await axios.get(`/api/faq/search`, {
      params: { keyword }
    });
    console.log('FAQ搜索响应:', response.data);
    // 假设 API 返回格式为 { success: true, data: { answer: '...' } }
    if (response.data && response.data.success && response.data.data?.answer) {
      return response.data.data.answer.trim(); // 确保返回字符串
    }
    console.log('未找到FAQ匹配项');
    return null; // 没有找到匹配的 FAQ
  } catch (error) {
    console.error('FAQ 搜索失败:', error);
    return null; // 发生错误时返回 null，后续将调用 AI
  }
}


async function sendMessage() {
  if (!userInput.value.trim() || isLoading.value) return;

  try {
    // 添加用户消息
    const message = userInput.value.trim();
    messages.value.push({ 
      role: 'user', 
      content: message,
      timestamp: Date.now()
    });

    isLoading.value = true;
    userInput.value = '';
    adjustTextareaHeight();

    // 首先尝试从 FAQ 数据库获取答案
    const faqAnswer = await searchFAQ(message);

    if (faqAnswer) {
      // 找到了 FAQ 匹配答案，直接使用
      messages.value.push({
        role: 'assistant',
        content: faqAnswer,
        timestamp: Date.now(),
        source: 'faq' // 可以标记来源，方便未来分析或显示
      });
      
      isLoading.value = false;
      scrollToBottom();
      return; // 提前结束函数执行，不再调用 AI
    }

    // 确保 WebSocket 连接
    if (!isConnected.value) {
      const authParams = await getSparkAccessToken();
      await reconnect(authParams).catch(error => {
        throw new Error(`WebSocket 重连失败: ${error.message}`);
      });
    }
    

    // 构建消息格式（适配 v4.0 API）
    const payload = {
      header: {
        app_id: import.meta.env.VITE_SPARK_APP_ID,
        uid: `user_${Date.now()}` // 动态生成唯一 UID
      },
      parameter: {
        chat: {
          domain: '4.0Ultra',
          temperature: 0.5,
          max_tokens: 1024
        }
      },
      payload: {
        message: {
          text: messages.value.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }
      }
    };

    sendWebSocketMessage(JSON.stringify(payload));
  } catch (error) {
    handleError(error, '发送消息失败');
    isLoading.value = false; // 确保错误时恢复加载状态
  }
}

function handleAIResponse(event) {
  try {
    const response = JSON.parse(event.data);

    // 检查响应状态
    if (!response.header) {
      throw new Error('响应格式错误：缺少 header');
    }

    // 处理 API 错误
    if (response.header.code !== 0) {
      throw new Error(`API 错误: ${response.header.code} - ${response.header.message}`);
    }

    // 处理消息内容
    if (response.payload && response.payload.choices && response.payload.choices.text) {
      const content = response.payload.choices.text[0].content;
      const lastMessage = messages.value[messages.value.length - 1];

      if (lastMessage && lastMessage.role === 'assistant') {
        lastMessage.content += content; // 追加到现有消息
      } else {
        messages.value.push({
          role: 'assistant',
          content: content,
          timestamp: Date.now()
        });
      }
      scrollToBottom();
    }

    // 检查是否为最终响应
    if (response.header.status === 2) {
      isLoading.value = false;
      console.log('会话完成');
    }
  } catch (error) {
    handleError(error, '处理响应失败');
    if (!isLoading.value) {
      isLoading.value = false; // 确保异常时恢复状态
    }
  }
}

function handleError(error, context = '未知错误') {
  isLoading.value = false;
  messages.value.push({ 
    role: 'assistant', 
    content: `抱歉，${context}：${error.message || '请稍后再试'}`,
    timestamp: Date.now()
  });
  console.error(`${context}:`, error);
  scrollToBottom();
}

function toggleAssistant() {
  isAssistantVisible.value = !isAssistantVisible.value;
  if (isAssistantVisible.value) {
    lastReadIndex.value = messages.value.length - 1;
    unreadMessages.value = 0;
    scrollToBottom();
    nextTick(() => messageInput.value?.focus());
  }
}

function closeAssistant() {
  isAssistantVisible.value = false;
}

function clearConversation() {
  messages.value = [];
  unreadMessages.value = 0;
  lastReadIndex.value = -1;
}

function adjustTextareaHeight() {
  const textarea = messageInput.value;
  if (!textarea) return;
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
}

function scrollToBottom() {
  nextTick(() => {
    const container = conversationContainer.value;
    if (container) container.scrollTop = container.scrollHeight;
  });
}

function toggleSettings() {
  showSettings.value = !showSettings.value;
}

function selectSuggestion(suggestion) {
  userInput.value = suggestion;
  if (isAssistantVisible.value) {
    sendMessage();
  } else {
    toggleAssistant();
    nextTick(() => sendMessage());
  }
}

function newLine(e) {
  e.preventDefault();
  userInput.value += '\n';
  adjustTextareaHeight();
}

onMounted(async () => {
  try {
    isAssistantVisible.value = true;
    const authParams = await getSparkAccessToken();
    connect(authParams);
  } catch (error) {
    handleError(error, '初始化失败');
  }
});
</script>


<style lang="scss" scoped>
.ai-assistant-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px;
  position: relative;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

// 页面头部样式优化
.page-header {
  text-align: center;
  padding: 30px 0;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;

  h1 {
    margin: 0;
    font-size: 28px;
    color: #1e293b;
    font-weight: 600;
  }

  p {
    margin: 8px 0 0;
    color: #64748b;
    font-size: 16px;
  }
}

// 内容区域样式优化与变量提取
$primary-color: #4f46e5;
$secondary-color: #7c3aed;
$text-primary: #1e293b;
$text-secondary: #64748b;
$border-color: #e2e8f0;
$background-light: #f8fafc;
$background-lighter: #f1f5f9;
$box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
$border-radius: 12px;
$transition-default: all 0.3s ease;

.page-content {
  max-width: 100%;
  margin: 0 auto;

  .welcome-section {
    background: #ffffff;
    padding: 30px;
    border-radius: $border-radius;
    box-shadow: $box-shadow;

    h2 {
      font-size: 22px;
      color: $text-primary;
      margin-top: 0;
      font-weight: 600;
    }

    p {
      color: $text-secondary;
      font-size: 16px;
      margin-bottom: 25px;
    }
  }
}

// 特性卡片网格布局优化
.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 25px;
}

.feature-card {
  background: $background-light;
  border-radius: 10px;
  padding: 20px;
  transition: $transition-default;
  cursor: pointer;
  border: 1px solid $border-color;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
    border-color: #cbd5e1;
  }

  .card-icon {
    width: 50px;
    height: 50px;
    background: rgba($primary-color, 0.1);
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 15px;
    color: $primary-color;
  }

  h3 {
    font-size: 18px;
    color: $text-primary;
    margin: 10px 0;
  }

  p {
    color: $text-secondary;
    font-size: 14px;
    margin: 0;
  }
}

// AI助手容器相关样式优化
.ai-assistant-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

// 混合创建
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.ai-assistant-trigger {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, $primary-color, $secondary-color);
  border-radius: 50%;
  @include flex-center;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba($primary-color, 0.4);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    transform: scale(1.1);
  }

  &.pulse {
    animation: pulse 2s infinite;
  }

  .ai-icon {
    width: 30px;
    height: 30px;
    color: white;
  }
}

.ai-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  padding: 3px 8px;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(239, 68, 68, 0.5);
}

// 模态框样式优化
.ai-assistant-modal {
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 400px;
  max-width: 90vw;
  height: 70vh;
  max-height: 85vh;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 头部样式优化
.ai-header {
  padding: 15px;
  border-bottom: 1px solid $border-color;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: $background-light;

  .header-title {
    display: flex;
    align-items: center;
    gap: 10px;

    .ai-logo {
      width: 24px;
      height: 24px;
      color: $primary-color;
    }

    h3 {
      margin: 0;
      font-size: 16px;
      color: $text-primary;
      font-weight: 600;
    }
  }

  .header-actions {
    display: flex;
    gap: 5px;

    .header-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      color: $text-secondary;
      border-radius: 8px;
      transition: all 0.2s;

      &:hover {
        background: $border-color;
        color: $text-primary;
      }
    }
  }
}

// 设置面板样式优化
.settings-panel {
  background: #ffffff;
  border-bottom: 1px solid $border-color;
  padding: 0;
  overflow: hidden;

  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    background: $background-lighter;

    h4 {
      margin: 0;
      font-size: 15px;
      color: $text-primary;
    }

    .close-settings {
      background: none;
      border: none;
      cursor: pointer;
      padding: 5px;
      color: $text-secondary;

      &:hover {
        color: $text-primary;
      }
    }
  }

  .settings-content {
    padding: 15px;
  }

  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    color: #334155;
    font-size: 14px;
  }

  // 开关样式组件化
  .switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;

    input {
      opacity: 0;
      width: 0;
      height: 0;

      &:checked + .slider {
        background-color: $primary-color;
      }

      &:checked + .slider:before {
        transform: translateX(20px);
      }
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #cbd5e1;
      transition: 0.4s;

      &:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: 0.4s;
      }

      &.round {
        border-radius: 34px;

        &:before {
          border-radius: 50%;
        }
      }
    }
  }

  .model-select {
    padding: 5px 10px;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
    color: #334155;
    background-color: $background-light;
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba($primary-color, 0.1);
    }
  }
}

// 对话容器样式优化
.ai-conversation-container {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  background: $background-light;
  scroll-behavior: smooth;

  .welcome-message {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    background: $background-lighter;
    border-radius: $border-radius;
    padding: 15px;
    margin-bottom: 15px;

    .ai-avatar {
      width: 40px;
      height: 40px;
      background: $primary-color;
      color: white;
      border-radius: 50%;
      @include flex-center;
      font-weight: bold;
      flex-shrink: 0;
    }

    .welcome-content {
      flex: 1;

      h4 {
        margin: 0 0 5px 0;
        color: $text-primary;
        font-size: 16px;
      }

      p {
        margin: 0 0 10px 0;
        color: $text-secondary;
        font-size: 14px;
      }
    }
  }

  // 建议标签样式优化
  .suggestion-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;

    .suggestion-chip {
      background: white;
      border: 1px solid #cbd5e1;
      border-radius: 16px;
      padding: 6px 12px;
      font-size: 13px;
      color: $primary-color;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: rgba($primary-color, 0.1);
        border-color: $primary-color;
      }
    }
  }

  // 消息样式组件化
  .message {
    margin-bottom: 20px;
    display: flex;
    gap: 12px;

    .message-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      @include flex-center;
      font-weight: 500;
      font-size: 14px;
      flex-shrink: 0;
    }

    .message-content {
      max-width: 80%;

      .content-text {
        padding: 12px 16px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.5;
        word-break: break-word;
      }

      .message-time {
        margin-top: 5px;
        font-size: 12px;
        color: #94a3b8;
        text-align: right;
      }
    }

    // 消息元数据样式优化
    .message-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 5px;
      font-size: 12px;
      color: #94a3b8;
    }

    .source-badge {
      padding: 2px 6px;
      background: rgba($primary-color, 0.1);
      color: $primary-color;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 500;
    }

    // 用户消息样式
    &.user-message {
      flex-direction: row-reverse;

      .message-avatar {
        background: $primary-color;
        color: white;
      }

      .message-content {
        .content-text {
          background: $primary-color;
          color: white;
          border-radius: 12px 3px 12px 12px;
        }

        .message-time {
          text-align: left;
        }
      }
    }

    // AI消息样式
    &.ai-message {
      .message-avatar {
        background: $background-lighter;
        color: $primary-color;
      }

      .message-content {
        .content-text {
          background: white;
          color: #334155;
          border-radius: 3px 12px 12px 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
      }
    }
  }

  // 打字指示器样式优化
  .ai-typing {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    margin-bottom: 20px;

    .ai-avatar {
      width: 36px;
      height: 36px;
      background: $background-lighter;
      color: $primary-color;
      border-radius: 50%;
      @include flex-center;
      font-weight: 500;
      font-size: 14px;
    }

    .typing-indicator {
      background: white;
      padding: 15px 20px;
      border-radius: 3px 12px 12px 12px;
      display: flex;
      gap: 4px;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

      .typing-dot {
        width: 8px;
        height: 8px;
        background: $primary-color;
        border-radius: 50%;
        opacity: 0.6;
        animation: typingBounce 1.4s infinite;

        &:nth-child(2) {
          animation-delay: 0.2s;
        }
        &:nth-child(3) {
          animation-delay: 0.4s;
        }
      }
    }
  }
}

// 输入容器样式优化
.ai-input-container {
  padding: 10px 15px 15px;
  border-top: 1px solid $border-color;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #ffffff;

  .input-tools {
    display: flex;
    gap: 5px;
    padding: 0 5px;

    .tool-button {
      background: none;
      border: none;
      cursor: pointer;
      color: $text-secondary;
      padding: 5px;
      border-radius: 5px;
      transition: all 0.2s;

      &:hover {
        background: $background-lighter;
        color: $primary-color;
      }
    }
  }

  .input-wrapper {
    display: flex;
    gap: 10px;
    align-items: flex-end;

    textarea {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 10px 15px;
      font-size: 14px;
      resize: none;
      outline: none;
      transition: all 0.2s;
      max-height: 100px;
      font-family: inherit;

      &:focus {
        border-color: $primary-color;
        box-shadow: 0 0 0 2px rgba($primary-color, 0.1);
      }
    }

    .send-button {
      background: $primary-color;
      color: white;
      border: none;
      border-radius: 10px;
      width: 40px;
      height: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        background: #4338ca;
        transform: translateY(-2px);
      }

      &:disabled {
        background: #cbd5e1;
        cursor: not-allowed;
      }
    }
  }

  .input-hint {
    font-size: 11px;
    color: #94a3b8;
    text-align: right;
    padding-right: 5px;
  }
}

// 过渡动画优化
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

// 关键帧动画优化
@keyframes typingBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba($primary-color, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba($primary-color, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba($primary-color, 0);
  }
}

// 媒体查询优化
@media (max-width: 768px) {
  .page-content {
    padding: 0 10px;
  }
  
  .ai-assistant-modal {
    width: 90vw;
    height: 80vh;
    bottom: 80px;
  }

  .feature-cards {
    grid-template-columns: 1fr;
  }
  
  .message .message-content {
    max-width: 85%;
  }
}

@media (max-width: 480px) {
  .ai-assistant-modal {
    width: 100%;
    height: 90vh;
    right: 0;
    bottom: 0;
    border-radius: 16px 16px 0 0;
  }
  
  .ai-assistant-trigger {
    width: 50px;
    height: 50px;
  }
  
  .ai-input-container {
    padding: 10px;
  }
  
  .message .message-content {
    max-width: 90%;
  }
}
</style>