<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'


import axios from 'axios'

const chartData = ref([]) // 存储 API 数据

const fetchChartData = async () => {
  try {
    const response = await axios.get('http://192.168.43.63:8080/message/rightTwo')
    console.log('API Response:', response.data)

    if (Array.isArray(response.data)) {
      chartData.value = response.data.map((item, index) => ({
        name: item.content || '暂无留言', // 直接显示留言
        value: [Math.random() * 100, Math.random() * 80 + 9, Number(item.value) || 50],
      }))
      initChart()
    } else {
      throw new Error('Invalid API response format')
    }
  } catch (error) {
    console.error('Error fetching chart data:', error)
    chartData.value = []
  }
}



const chartRef = ref(null)
let chart = null
const router = useRouter()

// 模拟用户留言数据与链接映射
const messageUrls = {
  '用户A': '/message/detail/1',
  '用户B': '/message/detail/2',
  '用户C': '/message/detail/3',
  '用户D': '/message/detail/4',
  '用户E': '/message/detail/5',
  '用户F': '/message/detail/6',
  '用户G': '/message/detail/7',
  '用户H': '/message/detail/8'
}

// 自定义字体大小计算（根据热度）
const getFontSize = (value) => {
  return Math.max(16, Math.min(value / 20 + 8, 28))
}

// 自定义气泡大小计算（根据热度）
const getSymbolSize = (value) => {
  return Math.max(10, Math.min(value / 2, 60))
}

const initChart = () => {
  if (!chartRef.value || chartData.value.length === 0) return

  chart = echarts.init(chartRef.value)
  console.log("Chart container dimensions:", chart.getDom().offsetWidth, chart.getDom().offsetHeight)

  const bubbleData = chartData.value.map(item => ({
    name: item.name, // 直接显示留言内容
    value: item.value,
    label: {
      show: true,
      formatter: '{b}', // 直接显示留言
      fontSize: getFontSize(item.value[2]), 
      color: '#fff',
      position: 'inside',
      overflow: 'break'
    },
    itemStyle: {
      color: 'rgba(173, 216, 230, 0.5)',
      borderColor: 'rgba(135, 206, 235, 0.8)',
      borderWidth: 3,
      shadowBlur: 15,
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      cursor: 'pointer'
    }
  }))

  const option = {
    xAxis: { show: false },
    yAxis: { show: false },
    grid: { top: '5%', bottom: '5%', left: '5%', right: '5%' },
    series: [{
      type: 'scatter',
      data: bubbleData,
      symbolSize: val => getSymbolSize(val[2]), 
      z: 2,
      emphasis: {
        label: {
          show: true,
          fontSize: 18,
          color: '#FFD700',
        },
        itemStyle: {
          borderColor: '#FFD700',
          borderWidth: 2,
          opacity: 1
        },
        symbolSize: val => getSymbolSize(val[2]) * 1.5
      },
      itemStyle: { cursor: 'pointer' },
      animationEasing: 'easeInOutQuad',
      animationDuration: 5000
    }]
  }

  chart.setOption(option)
}



onMounted(() => {
  fetchChartData()
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
  min-height: 300px;
  background: transparent;
}
</style>