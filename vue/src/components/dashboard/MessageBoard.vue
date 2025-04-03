<template>
  <div class="dashboard-container">
    <!-- Existing dashboard code remains unchanged -->
    
    <!-- Message Board - Add this right before the FloatingCar component -->
    <el-card class="message-board-card">
      <template #header>
        <div class="card-header-with-action">
          <span class="header-title">留言板</span>
          <el-button type="primary" size="small" @click="refreshMessages">
            刷新
          </el-button>
        </div>
      </template>
      
      <div v-loading="loading.messages" class="message-board-content">
        <el-empty 
          v-if="!messages.length" 
          description="暂无留言" 
          :image-size="120"
        />
        
        <div ref="messageListRef" class="message-list">
  <div v-for="message in messages" :key="message.id" class="message-item">
    <div class="message-header">
      <el-avatar :size="32" :src="formatAvatarUrl(message.avatar)"></el-avatar>
      <span class="message-username">{{ message.username }}</span>
      <span class="message-time text-gray-400">{{ formatMessageTime(message.createTime) }}</span>
    </div>
    <div class="message-content">{{ message.content }}</div>
    <div class="message-actions" v-if="message.userId === userInfo.id || role === 'ADMIN'">
      <el-button type="danger" link size="small" @click="handleDeleteMessage(message.id)">
        删除
      </el-button>
    </div>
  </div>
</div>
        
        <el-divider></el-divider>
        
        <div class="message-form">
          <el-input
            v-model="newMessage"
            type="textarea"
            :rows="3"
            placeholder="写下你的留言..."
            maxlength="200"
            show-word-limit
          ></el-input>
          <div class="form-actions">
            <el-button type="primary" @click="submitMessage" :loading="loading.submit">
              发布留言
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getMessageList, addMessage, deleteMessage } from '@/api/message';

// Existing imports remain unchanged

// API functions for message board - add these to a new file: @/api/message.js
// import { getMessageList, addMessage, deleteMessage } from '@/api/message';

const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'));
const role = ref(userInfo.value.role || 'USER');

// Add these to your existing loading ref
const loading = ref({
  messages: false,
  submit: false
});

// Message board data
const messages = ref([]);
const newMessage = ref('');

const messageListRef = ref(null);

// Add this helper function to your component
const formatAvatarUrl = (url) => {
  if (!url) return '/src/assets/imgs/avatar.png';
  
  // Check if the URL needs to be transformed (replace the IP with VITE_BASE_URL)
  if (url.includes('http://192.168.43.63:8080')) {
    return url.replace('http://192.168.43.63:8080', import.meta.env.VITE_BASE_URL);
  }
  
  return url;
};


const scrollToBottom = () => {
  nextTick(() => {
    const list = messageListRef.value;
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  });
};

// In your loadMessages function, add this:
const loadMessages = async () => {
  try {
    loading.value.messages = true;
    
    // Real API call
    const res = await getMessageList({ pageNum: 1, pageSize: 100 });
    
    // Process response
    if (res.code === '200') {
      // Debug each message object to see its structure
      console.log('Message objects:', res.data.records);
      messages.value = res.data.records;
      
      // Verify each message has an ID
      messages.value.forEach((msg, index) => {
        if (!msg.id) console.warn(`Message at index ${index} has no ID!`);
      });
      scrollToBottom();
    } else {
      ElMessage.warning(res.message || '获取留言失败');
    }
  } catch (error) {
    console.error('获取留言失败:', error);
    ElMessage.error('获取留言失败');
  } finally {
    loading.value.messages = false;
  }
};

// Format message time
const formatMessageTime = (time) => {
  if (!time) return '-';
  
  const messageTime = dayjs(time);
  const now = dayjs();
  
  if (now.diff(messageTime, 'day') === 0) {
    // Today
    return messageTime.format('HH:mm');
  } else if (now.diff(messageTime, 'day') === 1) {
    // Yesterday
    return '昨天 ' + messageTime.format('HH:mm');
  } else if (now.diff(messageTime, 'day') < 7) {
    // Within a week
    return messageTime.format('ddd HH:mm');
  } else {
    // Older
    return messageTime.format('YYYY-MM-DD HH:mm');
  }
};

const submitMessage = async () => {
  if (!newMessage.value.trim()) {
    ElMessage.warning('留言内容不能为空');
    return;
  }
  
  // Fix: Check if user is logged in
  if (!userInfo.value.id) {
    ElMessage.warning('请先登录');
    return;
  }
  
  try {
    loading.value.submit = true;  // Fix: Use submit loading state
    
    // Real API call
    const res = await addMessage({
      userId: userInfo.value.id,
      content: newMessage.value.trim()
    });
    
    if (res.code === '200') {
      ElMessage.success('留言发布成功');
      newMessage.value = '';
      
      // Refresh the message list instead of manually adding
      await loadMessages();
    } else {
      ElMessage.warning(res.message || '发布留言失败');
    }
  } catch (error) {
    console.error('发布留言失败:', error);
    ElMessage.error('发布留言失败');
  } finally {
    loading.value.submit = false;  // Fix: Set to false when done
  }
};
const handleDeleteMessage = async (id) => {
  if (!id) {
    ElMessage.error('无法删除留言：缺少ID');
    return;
  }
  try {
    await ElMessageBox.confirm(
      '确定要删除这条留言吗？',
      '删除留言',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    // Real API call
    const res = await deleteMessage(id);
    
    if (res.code === '200') {
      ElMessage.success('留言已删除');
      // Refresh the message list
      await loadMessages();
    } else {
      ElMessage.warning(res.message || '删除留言失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除留言失败:', error);
      ElMessage.error('删除留言失败');
    }
  }
};

// Refresh messages
const refreshMessages = () => {
  loadMessages();
};

// Add this to your onMounted function
onMounted(async () => {
  await loadMessages();
});
</script>

<style scoped>
.message-board-card {
  margin-top: 20px;
  margin-bottom: 20px;
}
.message-list {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px; /* 避免滚动条遮挡内容 */
}
.message-list::-webkit-scrollbar {
  width: 6px;
}
.message-list::-webkit-scrollbar-thumb {
  background-color: #888; /* 滚动条颜色 */
  border-radius: 10px;
}
.message-list::-webkit-scrollbar-thumb:hover {
  background-color: #555;
}

.message-item {
  padding: 16px;
  border-bottom: 1px solid #e8ecef; /* 更柔和的分隔线 */
  background-color: #fafafa; /* 浅灰背景 */
  border-radius: 8px; /* 圆角 */
  margin-bottom: 12px; /* 增加间距 */
  transition: all 0.2s ease; /* 悬浮动画 */
}

.message-item:hover {
  background-color: #f5f7fa; /* 悬浮时背景变色 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05); /* 轻微阴影 */
}

.message-item:last-child {
  border-bottom: none;
  margin-bottom: 0; /* 最后一个没有下边距 */
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.message-username {
  font-weight: bold;
  margin-left: 8px;
  margin-right: 8px;
}

.message-time {
  font-size: 12px;
}

.message-content {
  padding: 4px 0;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

.message-actions {
  text-align: right;
  margin-top: 8px;
}

.message-actions .el-button {
  padding: 6px 12px; /* 按钮更紧凑 */
  font-size: 12px;
  border-radius: 4px; /* 圆角按钮 */
  transition: all 0.3s ease;
}

.message-actions .el-button:hover {
  background-color: #3498db; /* 悬浮蓝色 */
  color: #fff;
}

.message-form {
  margin-top: 16px;
}

.form-actions {
  margin-top: 12px;
  text-align: right;
}
</style>