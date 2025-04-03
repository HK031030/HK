<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted,watch } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'

const chartRef = ref(null)
let chart = null

const chartData = ref([]) // Store the API response data
const loading = ref(false) // Loading state
const error = ref(null) // Error state

// API endpoint
const API_URL = 'http://192.168.43.63:8080/message/rightOne' // Replace with your actual API endpoint

// Fetch chart data from API
const fetchChartData = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } // 确保请求带上 token
    })
    
    console.log('API Response:', response.data)

    if (Array.isArray(response.data)) {
      chartData.value = response.data.map(item => ({
        name: item.name || '未知', // 处理name为空的情况
        value: Number(item.value) || 0 // 确保value是数字
      }))
    } else {
      throw new Error('Invalid API response format')
    }

    console.log('Processed Chart Data:', chartData.value)

  } catch (err) {
    error.value = err.message || 'Failed to fetch chart data'
    console.error('Error fetching chart data:', err)
    chartData.value = []
  } finally {
    loading.value = false
  }
}





const initChart = () => {
  if (!chartRef.value) return

  chart = echarts.init(chartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        if (params.data) {
          const currentData = chart.getOption().series[0].data
          const total = currentData.reduce((sum, item) => sum + (item.value || 0), 0)
          const percent = total ? ((params.value / total) * 100).toFixed(1) : 0
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
      data: chartData.value, // Use dynamic data from API
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

// Watch for changes in chartData to update the chart
watch(chartData, () => {
  if (chart) {
    chart.setOption({
      series: [{
        data: chartData.value
      }]
    })
  }
}, { immediate: true })

onMounted(async () => {
//   chartData.value = [
//   { name: "科目一", value: 2 },
//   { name: "科目三", value: 1 }
// ]
  await fetchChartData() // Fetch data when component mounts
  initChart() // Initialize chart after data is fetched
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