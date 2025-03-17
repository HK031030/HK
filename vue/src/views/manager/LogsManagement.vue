<template>
    <div class="logs-container">
      <div class="logs-header">
        <h2>系统日志管理</h2>
        <div class="logs-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索日志内容"
            style="width: 200px; margin-right: 10px"
            clearable
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <el-select v-model="logType" placeholder="日志类型" style="width: 120px; margin-right: 10px" @change="handleSearch">
            <el-option label="全部" value="" />
            <el-option label="登录日志" value="LOGIN" />
            <el-option label="操作日志" value="OPERATION" />
            <el-option label="系统日志" value="SYSTEM" />
            <el-option label="错误日志" value="ERROR" />
          </el-select>
          
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 300px; margin-right: 10px"
            @change="handleSearch"
          />
          
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button type="success" @click="handleExport">导出日志</el-button>
          <el-button type="danger" @click="handleClearLogs" v-if="hasPermission('logs-clear')">清空日志</el-button>
        </div>
      </div>
      
      <el-table :data="logs" border stripe style="width: 100%; margin-top: 20px">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="timestamp" label="时间" width="180" sortable />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag
              :type="getLogTypeTag(scope.row.type)"
              effect="plain"
            >
              {{ getLogTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="120" />
        <el-table-column prop="action" label="操作" width="120" />
        <el-table-column prop="content" label="内容" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="userAgent" label="客户端" width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="100" fixed="right" v-if="hasPermission('logs-detail')">
          <template #default="scope">
            <el-button size="small" @click="viewLogDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
      
      <!-- 日志详情对话框 -->
      <el-dialog
        v-model="logDetailVisible"
        title="日志详情"
        width="60%"
      >
        <div v-if="currentLog" class="log-detail">
          <div class="log-detail-item">
            <span class="log-detail-label">ID:</span>
            <span>{{ currentLog.id }}</span>
          </div>
          <div class="log-detail-item">
            <span class="log-detail-label">时间:</span>
            <span>{{ currentLog.timestamp }}</span>
          </div>
          <div class="log-detail-item">
            <span class="log-detail-label">用户:</span>
            <span>{{ currentLog.username }}</span>
          </div>
          <div class="log-detail-item">
            <span class="log-detail-label">类型:</span>
            <el-tag :type="getLogTypeTag(currentLog.type)">{{ getLogTypeText(currentLog.type) }}</el-tag>
          </div>
          <div class="log-detail-item">
            <span class="log-detail-label">模块:</span>
            <span>{{ currentLog.module }}</span>
          </div>
          <div class="log-detail-item">
            <span class="log-detail-label">操作:</span>
            <span>{{ currentLog.action }}</span>
          </div>
          <div class="log-detail-item">
            <span class="log-detail-label">内容:</span>
            <div class="log-content">{{ currentLog.content }}</div>
          </div>
          <div class="log-detail-item">
            <span class="log-detail-label">IP地址:</span>
            <span>{{ currentLog.ip }}</span>
          </div>
          <div class="log-detail-item">
            <span class="log-detail-label">客户端:</span>
            <span>{{ currentLog.userAgent }}</span>
          </div>
          <div class="log-detail-item" v-if="currentLog.params">
            <span class="log-detail-label">请求参数:</span>
            <pre class="log-params">{{ JSON.stringify(currentLog.params, null, 2) }}</pre>
          </div>
          <div class="log-detail-item" v-if="currentLog.stackTrace">
            <span class="log-detail-label">堆栈信息:</span>
            <pre class="log-stack-trace">{{ currentLog.stackTrace }}</pre>
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="logDetailVisible = false">关闭</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, reactive } from 'vue';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { Search } from '@element-plus/icons-vue';
  import axios from 'axios';
  
  // 分页相关
  const currentPage = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  
  // 搜索条件
  const searchKeyword = ref('');
  const logType = ref('');
  const dateRange = ref([]);
  
  // 日志数据
  const logs = ref([]);
  const logDetailVisible = ref(false);
  const currentLog = ref(null);
  
  // 模拟权限检查函数
  const hasPermission = (permission) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const role = userInfo.role || '';
    
    const permissions = {
      'ADMIN': ['logs-view', 'logs-search', 'logs-export', 'logs-clear', 'logs-detail'],
      'COACH': ['logs-view', 'logs-search'],
      'USER': []
    };
    
    return permissions[role]?.includes(permission) || false;
  };
  
  // 获取日志列表
  const fetchLogs = async () => {
    try {
      // 构建查询参数
      const params = {
        page: currentPage.value,
        size: pageSize.value,
        keyword: searchKeyword.value,
        type: logType.value,
      };
      
      // 添加日期范围参数
      if (dateRange.value && dateRange.value.length === 2) {
        params.startDate = formatDate(dateRange.value[0]);
        params.endDate = formatDate(dateRange.value[1]);
      }
      
      // API调用示例
      // const response = await axios.get('/api/logs', { params });
      // logs.value = response.data.records;
      // total.value = response.data.total;
      
      // 模拟数据，实际项目中应替换为真实API调用
      setTimeout(() => {
        logs.value = generateMockLogs();
        total.value = 100;
      }, 300);
    } catch (error) {
      console.error('获取日志失败:', error);
      ElMessage.error('获取日志失败，请稍后重试');
    }
  };
  
  // 日期格式化函数
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // 处理页面大小变化
  const handleSizeChange = (size) => {
    pageSize.value = size;
    fetchLogs();
  };
  
  // 处理页码变化
  const handleCurrentChange = (page) => {
    currentPage.value = page;
    fetchLogs();
  };
  
  // 搜索
  const handleSearch = () => {
    currentPage.value = 1;
    fetchLogs();
  };
  
  // 导出日志
  const handleExport = async () => {
    try {
      ElMessage.success('日志导出成功');
      // 实际实现中应该调用后端API导出日志
      // window.location.href = `/api/logs/export?keyword=${searchKeyword.value}&type=${logType.value}...`;
    } catch (error) {
      console.error('导出日志失败:', error);
      ElMessage.error('导出日志失败，请稍后重试');
    }
  };
  
  // 清空日志
  const handleClearLogs = async () => {
    try {
      await ElMessageBox.confirm('确定要清空所有日志吗？此操作不可恢复！', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
      
      // 实际实现中应该调用后端API清空日志
      // await axios.delete('/api/logs/clear');
      
      ElMessage.success('日志清空成功');
      fetchLogs();
    } catch (error) {
      if (error !== 'cancel') {
        console.error('清空日志失败:', error);
        ElMessage.error('清空日志失败，请稍后重试');
      }
    }
  };
  
  // 查看日志详情
  const viewLogDetail = (log) => {
    currentLog.value = log;
    logDetailVisible.value = true;
  };
  
  // 获取日志类型标签样式
  const getLogTypeTag = (type) => {
    const typeMap = {
      'LOGIN': 'info',
      'OPERATION': 'success',
      'SYSTEM': 'warning',
      'ERROR': 'danger'
    };
    return typeMap[type] || 'info';
  };
  
  // 获取日志类型显示文本
  const getLogTypeText = (type) => {
    const typeMap = {
      'LOGIN': '登录日志',
      'OPERATION': '操作日志',
      'SYSTEM': '系统日志',
      'ERROR': '错误日志'
    };
    return typeMap[type] || '未知';
  };
  
  // 生成模拟日志数据（仅用于演示）
  const generateMockLogs = () => {
    const mockLogs = [];
    const types = ['LOGIN', 'OPERATION', 'SYSTEM', 'ERROR'];
    const modules = ['用户管理', '课程管理', '系统设置', '预约管理'];
    const actions = ['查询', '添加', '修改', '删除', '登录', '退出'];
    const users = ['admin', 'coach1', 'user1', 'system'];
    
    for (let i = 1; i <= pageSize.value; i++) {
      const typeIndex = Math.floor(Math.random() * types.length);
      const type = types[typeIndex];
      
      let content = '';
      let params = null;
      let stackTrace = null;
      
      switch (type) {
        case 'LOGIN':
          content = `用户 ${users[Math.floor(Math.random() * users.length)]} 登录系统`;
          break;
        case 'OPERATION':
          const actionIndex = Math.floor(Math.random() * (actions.length - 2));
          const moduleIndex = Math.floor(Math.random() * modules.length);
          content = `${actions[actionIndex]}${modules[moduleIndex]}记录`;
          params = { id: Math.floor(Math.random() * 1000), data: { name: '示例数据' } };
          break;
        case 'SYSTEM':
          content = '系统定时任务执行';
          break;
        case 'ERROR':
          content = '系统遇到异常：数据库连接失败';
          stackTrace = 'java.sql.SQLException: Connection refused\n  at com.mysql.jdbc.Connection.createNewIO(Connection.java:2847)\n  at com.mysql.jdbc.Connection.<init>(Connection.java:1555)';
          break;
      }
      
      const date = new Date();
      date.setMinutes(date.getMinutes() - i * 10);
      
      mockLogs.push({
        id: (currentPage.value - 1) * pageSize.value + i,
        timestamp: date.toLocaleString(),
        username: users[Math.floor(Math.random() * users.length)],
        type: type,
        module: modules[Math.floor(Math.random() * modules.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        content: content,
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        params: params,
        stackTrace: stackTrace
      });
    }
    
    return mockLogs;
  };
  
  // 组件挂载时获取日志列表
  onMounted(() => {
    fetchLogs();
  });
  </script>
  
  <style scoped>
  .logs-container {
    padding: 20px;
  }
  
  .logs-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .logs-actions {
    display: flex;
    align-items: center;
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
  
  .log-detail {
    padding: 10px;
  }
  
  .log-detail-item {
    margin-bottom: 15px;
  }
  
  .log-detail-label {
    font-weight: bold;
    margin-right: 10px;
    display: inline-block;
    width: 100px;
    vertical-align: top;
  }
  
  .log-content {
    white-space: pre-wrap;
    word-break: break-all;
    margin-top: 5px;
    padding: 10px;
    background-color: #f8f8f8;
    border-radius: 4px;
  }
  
  .log-params, .log-stack-trace {
    margin-top: 5px;
    padding: 10px;
    background-color: #f8f8f8;
    border-radius: 4px;
    max-height: 200px;
    overflow: auto;
  }
  </style>