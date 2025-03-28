<template>
  <div class="main_m_t">
    <div class="item1" v-for="(item, index) in panelData" :key="index">
      <div class="current-row">
        <span class="title">{{ item.title }}</span>
        <span class="num" data-value>{{ item.value }}</span>
        <span class="unit">{{ item.unit }}</span>
      </div>
      <div class="predict-row">
        <span class="title">预测值</span>
        <span class="num" data-value>{{ item.predicted }}</span>
        <span class="arrow" :class="getArrowClass(item)">{{ getArrowSymbol(item) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const panelData = ref([
  {
    title: '今日预约',
    value: 128,
    predicted: 135,
    unit: '人'
  },
  {
    title: '课程完成率',
    value: 85,
    predicted: 88,
    unit: '%'
  },
  {
    title: '教练评分',
    value: 4.5,
    predicted: 4.6,
    unit: '分'
  },
  {
    title: '增长率',
    value: 15,
    predicted: 18,
    unit: '%'
  }
])

const getArrowClass = (item) => {
  if (item.predicted > item.value) return 'up'
  if (item.predicted < item.value) return 'down'
  return 'flat'
}

const getArrowSymbol = (item) => {
  if (item.predicted > item.value) return '↑'
  if (item.predicted < item.value) return '↓'
  return '→'
}
</script>

<style lang="scss" scoped>
.main_m_t {
  width: 100%;
  height: 100%;  // 修改为100%自适应高度
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;  // 使用px固定间距
  box-sizing: border-box;

  .item1 {
    background: rgba(12, 31, 86, 0.7);
    border-radius: 8px;
    padding: 15px;  // 使用px固定内边距
    height: 100%;  // 添加高度100%
    display: flex;  // 改用flex布局
    flex-direction: column;
    justify-content: center;  // 垂直居中
    gap: 10px;  // 行间距
    
    .current-row,
    .predict-row {
      display: flex;
      align-items: center;
      flex-wrap: nowrap;  // 防止换行

      .title {
        font-size: 14px;  // 使用px固定字号
        color: #adf3e6;
        white-space: nowrap;  // 防止文字换行
        margin-right: 8px;
      }

      .num {
        font-size: 24px;  // 使用px固定字号
        color: #fff;
        font-weight: bold;
        flex-grow: 1;  // 数字部分自适应增长
        text-align: right;  // 数字右对齐
      }

      .unit {
        font-size: 14px;
        color: #adf3e6;
        margin-left: 8px;
        white-space: nowrap;
      }

      .arrow {
        margin-left: 8px;
        font-size: 14px;
        width: 20px;  // 固定箭头宽度
        text-align: center;

        &.up { color: #67C23A; }
        &.down { color: #F56C6C; }
        &.flat { color: #909399; }
      }
    }

    // 为当前值和预测值添加不同样式
    .current-row {
      .num {
        font-size: 28px;  // 当前值字号稍大
        background: linear-gradient(to right, #fff, #adf3e6);
        -webkit-background-clip: text;
        color: transparent;
      }
    }
    
    .predict-row {
      opacity: 0.8;  // 预测值稍微透明
    }
  }
}

// 添加响应式样式
@media screen and (max-width: 1600px) {
  .main_m_t {
    gap: 10px;
    
    .item1 {
      padding: 12px;
      
      .current-row,
      .predict-row {
        .title { font-size: 12px; }
        .num { font-size: 20px; }
        .unit { font-size: 12px; }
        .arrow { font-size: 12px; }
      }
    }
  }
}

@media screen and (min-width: 1920px) {
  .main_m_t {
    gap: 20px;
    
    .item1 {
      padding: 20px;
      
      .current-row,
      .predict-row {
        .title { font-size: 16px; }
        .num { 
          font-size: 32px;
          &.current { font-size: 36px; }
        }
        .unit { font-size: 16px; }
        .arrow { font-size: 16px; }
      }
    }
  }
}
</style>