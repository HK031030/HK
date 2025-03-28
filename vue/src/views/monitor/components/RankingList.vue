<template>
  <div class="ranking-list">
    <div class="header">
      <div class="tabs">
        <span 
          :class="{ active: activeTab === 'month' }" 
          @click="switchTab('month')"
        >月度排名</span>
        <span 
          :class="{ active: activeTab === 'year' }" 
          @click="switchTab('year')"
        >年度排名</span>
      </div>
    </div>
    <div class="list-content">
      <div class="list-item" v-for="(item, index) in currentList" :key="index">
        <div class="rank" :class="getRankClass(index)">{{ index + 1 }}</div>
        <div class="info">
          <div class="name">{{ item.name }}</div>
          <div class="score">{{ item.score }}分</div>
        </div>
        <div class="value">
          {{ item.value }}
          <span class="trend" :class="item.trend">
            {{ getTrendSymbol(item.trend) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeTab = ref('month')

const monthData = [
  { name: '张教练', score: 95, value: 150, trend: 'up' },
  { name: '李教练', score: 92, value: 142, trend: 'up' },
  { name: '王教练', score: 88, value: 138, trend: 'down' },
  { name: '赵教练', score: 85, value: 130, trend: 'flat' },
  { name: '刘教练', score: 82, value: 125, trend: 'up' }
]

const yearData = [
  { name: '李教练', score: 94, value: 1580, trend: 'up' },
  { name: '张教练', score: 93, value: 1520, trend: 'up' },
  { name: '王教练', score: 90, value: 1480, trend: 'up' },
  { name: '刘教练', score: 87, value: 1350, trend: 'down' },
  { name: '赵教练', score: 85, value: 1280, trend: 'flat' }
]

const currentList = computed(() => {
  return activeTab.value === 'month' ? monthData : yearData
})

const switchTab = (tab) => {
  activeTab.value = tab
}

const getRankClass = (index) => {
  const classes = ['rank-1', 'rank-2', 'rank-3']
  return index < 3 ? classes[index] : ''
}

const getTrendSymbol = (trend) => {
  switch (trend) {
    case 'up': return '↑'
    case 'down': return '↓'
    default: return '→'
  }
}
</script>

<style lang="scss" scoped>
.ranking-list {
  padding: 0.2rem;
  height: 100%;
  
  .header {
    margin-bottom: 0.2rem;
    
    .tabs {
      display: flex;
      gap: 0.2rem;
      
      span {
        padding: 0.1rem 0.2rem;
        color: #adf3e6;
        cursor: pointer;
        
        &.active {
          color: #fff;
          background: rgba(173, 243, 230, 0.2);
          border-radius: 4px;
        }
      }
    }
  }
  
  .list-content {
    .list-item {
      display: flex;
      align-items: center;
      padding: 0.15rem 0;
      border-bottom: 1px solid rgba(173, 243, 230, 0.1);
      
      .rank {
        width: 0.4rem;
        text-align: center;
        color: #adf3e6;
        font-weight: bold;
        
        &.rank-1 { color: #FFD700; }
        &.rank-2 { color: #C0C0C0; }
        &.rank-3 { color: #CD7F32; }
      }
      
      .info {
        flex: 1;
        margin-left: 0.2rem;
        
        .name {
          color: #fff;
          font-size: 0.26rem;
        }
        
        .score {
          color: #adf3e6;
          font-size: 0.22rem;
        }
      }
      
      .value {
        color: #fff;
        font-size: 0.26rem;
        
        .trend {
          margin-left: 0.1rem;
          font-size: 0.22rem;
          
          &.up { color: #67C23A; }
          &.down { color: #F56C6C; }
          &.flat { color: #909399; }
        }
      }
    }
  }
}
</style>