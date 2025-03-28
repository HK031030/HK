<template>
  <div class="data-table">
    <div class="header">
      <div class="search">
        <input 
          type="text" 
          v-model="searchText" 
          placeholder="搜索教练姓名"
        >
      </div>
      <div class="filter">
        <select v-model="currentFilter">
          <option value="all">全部课程</option>
          <option value="subject2">科目二</option>
          <option value="subject3">科目三</option>
          <option value="normal">普通课程</option>
        </select>
      </div>
    </div>
    
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key">
              {{ col.title }}
              <span 
                v-if="col.sortable" 
                class="sort-icon"
                @click="handleSort(col.key)"
              >
                {{ getSortIcon(col.key) }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredData" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.courseType }}</td>
            <td>{{ item.studentCount }}</td>
            <td>{{ item.completeRate }}%</td>
            <td>{{ item.rating }}</td>
            <td>
              <span :class="getStatusClass(item.status)">
                {{ item.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchText = ref('')
const currentFilter = ref('all')
const sortConfig = ref({ key: '', order: '' })

const columns = [
  { title: '教练姓名', key: 'name', sortable: true },
  { title: '课程类型', key: 'courseType' },
  { title: '学员数量', key: 'studentCount', sortable: true },
  { title: '完成率', key: 'completeRate', sortable: true },
  { title: '评分', key: 'rating', sortable: true },
  { title: '状态', key: 'status' }
]

const tableData = [
  { 
    id: 1, 
    name: '张教练', 
    courseType: '科目二', 
    studentCount: 45, 
    completeRate: 95, 
    rating: 4.8, 
    status: '授课中' 
  },
  // ... 更多数据
]

const filteredData = computed(() => {
  let result = [...tableData]
  
  // 搜索过滤
  if (searchText.value) {
    result = result.filter(item => 
      item.name.includes(searchText.value)
    )
  }
  
  // 课程类型过滤
  if (currentFilter.value !== 'all') {
    result = result.filter(item => 
      item.courseType === currentFilter.value
    )
  }
  
  // 排序
  if (sortConfig.value.key && sortConfig.value.order) {
    result.sort((a, b) => {
      if (sortConfig.value.order === 'asc') {
        return a[sortConfig.value.key] - b[sortConfig.value.key]
      } else {
        return b[sortConfig.value.key] - a[sortConfig.value.key]
      }
    })
  }
  
  return result
})

const handleSort = (key) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.order = sortConfig.value.order === 'asc' ? 'desc' : 'asc'
  } else {
    sortConfig.value = { key, order: 'asc' }
  }
}

const getSortIcon = (key) => {
  if (sortConfig.value.key !== key) return '↕'
  return sortConfig.value.order === 'asc' ? '↑' : '↓'
}

const getStatusClass = (status) => {
  switch (status) {
    case '授课中': return 'status-active'
    case '已完成': return 'status-completed'
    case '待开始': return 'status-pending'
    default: return ''
  }
}
</script>

<style lang="scss" scoped>
.data-table {
  height: 100%;
  padding: 0.2rem;
  
  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.2rem;
    
    .search input,
    .filter select {
      padding: 0.1rem;
      background: rgba(173, 243, 230, 0.1);
      border: 1px solid rgba(173, 243, 230, 0.2);
      color: #fff;
      border-radius: 4px;
      
      &::placeholder {
        color: rgba(173, 243, 230, 0.5);
      }
    }
  }
  
  .table-container {
    height: calc(100% - 0.6rem);
    overflow-y: auto;
    
    table {
      width: 100%;
      border-collapse: collapse;
      
      th, td {
        padding: 0.15rem;
        text-align: left;
        border-bottom: 1px solid rgba(173, 243, 230, 0.1);
      }
      
      th {
        color: #adf3e6;
        font-weight: normal;
        
        .sort-icon {
          margin-left: 0.1rem;
          cursor: pointer;
        }
      }
      
      td {
        color: #fff;
        
        .status-active { color: #67C23A; }
        .status-completed { color: #909399; }
        .status-pending { color: #E6A23C; }
      }
    }
  }
}
</style>