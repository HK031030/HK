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
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        if (params.data) {
          const currentData = chart.getOption().series[0].data
          const total = currentData.reduce((sum, item) => sum + item.value, 0)
          const percent = ((params.value / total) * 100).toFixed(1)
          return `${params.name}<br/>数量: ${params.value}<br/>占比: ${percent}%`
        }
        return '暂无数据'
      },
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderColor: '#00FFE3',
      textStyle: { color: '#fff' }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        color: '#ffffff'
      }
    },
    series: [{
      name: '课程类型',
      type: 'pie',
      radius: ['20%', '60%'],
      center: ['60%', '50%'],
      data: [
        { value: 335, name: '科目二' },
        { value: 310, name: '科目三' },
        { value: 234, name: '模拟训练' },
        { value: 135, name: '理论课程' },
        { value: 156, name: '特训课程' }
      ],
      label: {
        show: true,
        color: '#ffffff'
      },
      itemStyle: {
        color: function(params) {
          const colors = ['#60A3BC', '#4A69BD', '#6A89CC', '#82CCDD', '#546DE5']
          return colors[params.dataIndex % colors.length]
        }
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
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
  background: transparent;
}
</style>