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
  
  chart = echarts.init(chartRef.value)
  
  // 生成模拟数据
  const hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a',
    '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p']
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  
  const data = []
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 24; j++) {
      data.push([j, i, Math.round(Math.random() * 10)])
    }
  }

  const option = {
    tooltip: {
      position: 'top',
      formatter: function (params) {
        return `${days[params.value[1]]} ${hours[params.value[0]]}<br/>预约数: ${params.value[2]}`
      },
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderColor: '#00FFE3',
      textStyle: { color: '#fff' }
    },
    grid: {
      top: '3%',
      left: '5%',
      right: '5%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: hours,
      splitArea: {
        show: true
      },
      axisLine: {
        lineStyle: {
          color: '#adf3e6'
        }
      },
      axisLabel: {
        color: '#adf3e6',
        interval: 2
      }
    },
    yAxis: {
      type: 'category',
      data: days,
      splitArea: {
        show: true
      },
      axisLine: {
        lineStyle: {
          color: '#adf3e6'
        }
      },
      axisLabel: {
        color: '#adf3e6'
      }
    },
    visualMap: {
      min: 0,
      max: 10,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      textStyle: {
        color: '#adf3e6'
      },
      inRange: {
        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf',
          '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
      }
    },
    series: [{
      name: '预约数量',
      type: 'heatmap',
      data: data,
      label: {
        show: false
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
  
  chart.setOption(option)
}

// 更新数据
const updateData = async () => {
  // 这里可以添加实际的数据获取逻辑
  const newData = []
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 24; j++) {
      newData.push([j, i, Math.round(Math.random() * 10)])
    }
  }
  
  chart?.setOption({
    series: [{
      data: newData
    }]
  })
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chart?.resize())
  
  // 定时更新数据
  const timer = setInterval(updateData, 5000)
  
  onUnmounted(() => {
    clearInterval(timer)
    window.removeEventListener('resize', () => chart?.resize())
    chart?.dispose()
  })
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  background: transparent;
}
</style>