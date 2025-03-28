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
    grid: {
      left: '8%',
      right: '7%',
      top: '15%',
      bottom: '15%'
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderColor: '#00FFE3',
      textStyle: { color: '#fff' },
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['科目二', '科目三', '普通课程'],
      textStyle: {
        color: '#ffffff',
        fontSize: 10
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: true,
      axisLine: {
        lineStyle: {
          color: '#adf3e6'
        }
      },
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: "#adf3e6"
      },
      name: '预约人数',
      nameTextStyle: {
        color: '#adf3e6',
        padding: [0, 0, 0, 20]
      }
    },
    series: [
      {
        name: '科目二',
        type: 'line',
        smooth: true,
        data: [120, 132, 101, 134, 90, 230, 210],
        itemStyle: {
          color: '#60A3BC'
        }
      },
      {
        name: '科目三',
        type: 'line',
        smooth: true,
        data: [220, 182, 191, 234, 290, 330, 310],
        itemStyle: {
          color: '#4A69BD'
        }
      },
      {
        name: '普通课程',
        type: 'line',
        smooth: true,
        data: [150, 232, 201, 154, 190, 330, 410],
        itemStyle: {
          color: '#6A89CC'
        }
      }
    ]
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