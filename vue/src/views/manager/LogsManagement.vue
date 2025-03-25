<template>
    <div class="logs-container">
      <div class="logs-header">
        <h2>系统日志管理</h2>
        <div class="logs-actions">
          <el-select 
            v-model="descriptionType" 
            placeholder="操作类型" 
            style="width: 150px; margin-right: 10px" 
            clearable
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="新增" value="新增" />
            <el-option label="修改" value="修改" />
            <el-option label="删除" value="删除" />
            <el-option label="批量删除" value="批量删除" />
            <el-option label="登录" value="登录" />
            <el-option label="注册" value="注册" />
            <el-option label="预约" value="预约" />
            <el-option label="取消预约" value="取消预约" />
          </el-select>
          
          <el-select 
            v-model="roleType" 
            placeholder="用户角色" 
            style="width: 120px; margin-right: 10px" 
            clearable
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="管理员" value="ADMIN" />
            <el-option label="教练" value="COACH" />
            <el-option label="学员" value="USER" />
          </el-select>
          
          <el-button type="success" @click="handleExport">导出日志</el-button>
          <el-button type="danger" @click="handleClearLogs" v-if="hasPermission('logs-clear')">清空日志</el-button>
        </div>
      </div>
      
      <el-table :data="logs" border stripe style="width: 100%; margin-top: 20px">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="time" label="时间" width="180" sortable />
        <el-table-column prop="user" label="用户" width="120" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="scope">
            <el-tag :type="getRoleType(scope.row.role)">
              {{ getRoleText(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operation" label="操作" width="120" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP地址" width="140" />
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
            <span>{{ currentLog.time }}</span>
          </div>
          <div class="log-detail-item">
            <span class="log-detail-label">用户:</span>
            <span>{{ currentLog.user }}</span>
          </div>
          <div class="log-detail-item">
            <span class="log-detail-label">角色:</span>
            <el-tag :type="getRoleType(currentLog.role)">{{ getRoleText(currentLog.role) }}</el-tag>
          </div>
          <div class="log-detail-item">
            <span class="log-detail-label">操作:</span>
            <span>{{ currentLog.operation }}</span>
          </div>
          <div class="log-detail-item">
            <span class="log-detail-label">描述:</span>
            <div class="log-content">{{ currentLog.description }}</div>
          </div>
          <div class="log-detail-item">
            <span class="log-detail-label">IP地址:</span>
            <span>{{ currentLog.ip }}</span>
          </div>
        </div>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, reactive } from 'vue';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { Search } from '@element-plus/icons-vue';
  import axios from 'axios';
  import { getLogList, exportLogs, clearLogs } from '@/api/log'
  import { debounce } from 'lodash-es'
  
  // 分页相关
  const currentPage = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  
  // 搜索条件
  const descriptionType = ref('');
  const roleType = ref('');
 
  
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
        pageNum: currentPage.value,
        pageSize: pageSize.value,
        description: descriptionType.value,
        role: roleType.value,
      };
      
      const res = await getLogList(params);
      if (res.code === '200') {
        logs.value = res.data.records;
        total.value = res.data.total;
      } else {
        ElMessage.error(res.msg || '获取日志失败');
      }
    } catch (error) {
      console.error('获取日志失败:', error);
      ElMessage.error('获取日志失败，请稍后重试');
    }
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
  const handleSearch = debounce(() => {
    currentPage.value = 1;
    fetchLogs();
  }, 300);
  
  // 导出日志
  const handleExport = async () => {
  try {
    const res = await exportLogs();
    const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `系统日志_${new Date().toLocaleDateString()}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    ElMessage.success('日志导出成功');
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
      
      const res = await clearLogs();
      if (res.code === '200') {
        ElMessage.success('日志清空成功');
        fetchLogs();
      } else {
        ElMessage.error(res.msg || '清空日志失败');
      }
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
  
  // 获取角色标签样式
  const getRoleType = (role) => {
    const roleMap = {
      'ADMIN': 'danger',
      'COACH': 'warning',
      'USER': 'info'
    };
    return roleMap[role] || 'info';
  };

  // 获取角色显示文本
  const getRoleText = (role) => {
    const roleMap = {
      'ADMIN': '管理员',
      'COACH': '教练',
      'USER': '学员'
    };
    return roleMap[role] || '未知';
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