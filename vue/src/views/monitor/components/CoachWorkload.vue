<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref(null)
let chart = null

const initChart = () => {
  if (!chartRef.value) return
  
  // 确保在创建新实例前销毁旧实例
  if (chart) {
    chart.dispose()
  }
  
  // 初始化图表
  chart = echarts.init(chartRef.value, null, {
    renderer: 'canvas',
    useDirtyRect: true // 启用脏矩形渲染优化
  })
  
  // 生成柔和的蓝色系颜色
  const generateBlueColor = (index) => {
    const baseColor = [173, 216, 230]  // 浅蓝色的RGB
    const variation = (index * 5) % 40  
    const r = Math.max(173, baseColor[0] + variation)
    const g = Math.min(216, baseColor[1] - variation)
    const b = Math.max(200, baseColor[2] - variation)
    return `rgb(${r}, ${g}, ${b})`
  }

  const option = {
    grid: { 
      top: 5, 
      bottom: 35, 
      left: 52, 
      right: 25,
      height: '80%' 
    },
    xAxis: { 
      max: 'dataMax',
      axisLabel: {
        color: '#adf3e6'
      }
    },
    yAxis: {
      type: 'category',
      inverse: true,
      axisLabel: {
        show: true,
        color: '#adf3e6',
        fontSize: 12
      },
      data: ['张教练', '李教练', '王教练', '赵教练', '刘教练']
    },
    series: [{
      realtimeSort: true,
      type: 'bar',
      data: [38, 32, 30, 28, 26],
      label: {
        show: true,
        position: 'right',
        valueAnimation: true,
        color: '#adf3e6',
        fontSize: 12
      },
      itemStyle: {
        color: function(params) {
          return generateBlueColor(params.dataIndex)
        }
      }
    }],
    animationDuration: 3000,
    animationEasing: 'linear',
    animationDelay: function (idx) {
      return idx * 200
    }
  }
  
  chart.setOption(option)
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chart?.resize())
})

onUnmounted(() => {
  window.removeEventListener('resize', () => chart?.resize())
  chart?.dispose()
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 200px;
}
</style>



<!-- <template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'

const chartRef = ref(null)
let chart = null
const coachData = ref({ coaches: [], workloads: [] })
let timer = null

const initChart = () => {
  chart = echarts.init(chartRef.value)
  const option = {
    grid: { top: 5, bottom: 35, left: 52, right: 25, height: '80%' },
    xAxis: { max: 'dataMax', axisLabel: { color: '#adf3e6' } },
    yAxis: {
      type: 'category',
      inverse: true,
      axisLabel: { color: '#adf3e6', fontSize: 12 },
      data: coachData.value.coaches
    },
    series: [{
      realtimeSort: true,
      type: 'bar',
      data: coachData.value.workloads,
      label: { show: true, position: 'right', color: '#adf3e6', fontSize: 12 }
    }]
  }
  chart.setOption(option)
}

const fetchData = async () => {
  try {
    const response = await axios.get('/api/coach/workload')
    if (response.data.code === '200') {
      coachData.value = response.data.data
      updateChart()
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

const updateChart = () => {
  const option = chart.getOption()
  option.yAxis[0].data = coachData.value.coaches
  option.series[0].data = coachData.value.workloads
  chart.setOption(option)
}

onMounted(() => {
  initChart()
  fetchData()
  timer = setInterval(fetchData, 5000) // 每5秒刷新
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  chart?.dispose()
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 200px;
}
</style> -->