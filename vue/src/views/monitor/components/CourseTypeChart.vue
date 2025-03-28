<template>
  <div class="course-type-chart">
    <div class="chart-tabs">
      <span 
        :class="{ active: currentType === 'course' }"
        @click="switchType('course')"
      >
        课程类型分布
      </span>
      <span 
        :class="{ active: currentType === 'coach' }"
        @click="switchType('coach')"
      >
        教练授课比例
      </span>
    </div>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref(null)
let chart = null
const currentType = ref('course')

const courseData = [
  { value: 335, name: '科目二' },
  { value: 310, name: '科目三' },
  { value: 234, name: '普通课程' },
  { value: 135, name: '特训课程' }
]

const coachData = [
  { value: 30, name: '张教练' },
  { value: 25, name: '李教练' },
  { value: 20, name: '王教练' },
  { value: 15, name: '赵教练' },
  { value: 10, name: '刘教练' }
]

const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  updateChart()
}

const updateChart = () => {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: {
        color: '#fff'
      }
    },
    series: [
      {
        name: currentType.value === 'course' ? '课程类型' : '教练授课',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '30',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: currentType.value === 'course' ? courseData : coachData
      }
    ]
  }
  
  chart?.setOption(option)
}

const switchType = (type) => {
  currentType.value = type
}

watch(currentType, () => {
  updateChart()
})

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chart?.resize())
})

onUnmounted(() => {
  chart?.dispose()
})
</script>

<style scoped>
.course-type-chart {
  height: 100%;
  
  .chart-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    
    span {
      cursor: pointer;
      padding: 4px 12px;
      border-radius: 4px;
      color: #fff;
      
      &.active {
        background: #409EFF;
      }
      
      &:hover {
        opacity: 0.8;
      }
    }
  }
  
  .chart-container {
    height: calc(100% - 40px);
  }
}
</style>