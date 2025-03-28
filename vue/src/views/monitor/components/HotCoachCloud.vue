<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref(null)
let chart = null

// 模拟教练数据与链接映射
const coachUrls = {
  '张教练': '/coach/detail/1',
  '李教练': '/coach/detail/2',
  '王教练': '/coach/detail/3',
  '赵教练': '/coach/detail/4',
  '刘教练': '/coach/detail/5',
  '孙教练': '/coach/detail/6',
  '周教练': '/coach/detail/7',
  '吴教练': '/coach/detail/8'
}

// 自定义字体大小计算
const getFontSize = (value) => {
  return Math.max(20, Math.min(value / 20 + 8, 30))
}

// 自定义气泡大小计算
const getSymbolSize = (value) => {
  return Math.max(10, Math.min(value / 2, 50))
}

const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  console.log("Chart container dimensions:", chart.getDom().offsetWidth, chart.getDom().offsetHeight)

  // 生成气泡数据
  const numBubbles = 8
  const spacing = 100 / numBubbles
  
  const bubbleData = [
    { name: '张教练', value: 95 },
    { name: '李教练', value: 88 },
    { name: '王教练', value: 85 },
    { name: '赵教练', value: 82 },
    { name: '刘教练', value: 78 },
    { name: '孙教练', value: 75 },
    { name: '周教练', value: 72 },
    { name: '吴教练', value: 70 }
  ].map((item, index) => {
    const xPosition = (index * spacing) % 100
    const yPosition = Math.random() * 80 + 9

    return {
      name: item.name,
      value: [xPosition, yPosition, item.value],
      label: {
        show: true,
        formatter: '{b}',
        fontSize: getFontSize(item.value),
        color: '#fff',
        position: 'inside'
      },
      itemStyle: {
        color: 'rgba(173, 216, 230, 0.5)',
        borderColor: 'rgba(135, 206, 235, 0.8)',
        borderWidth: 3,
        shadowBlur: 15,
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        cursor: 'pointer'  // 在这里添加鼠标指针样式
      }
    }
  })

  const option = {
    xAxis: { show: false },
    yAxis: { show: false },
    grid: {
      top: '5%',
      bottom: '5%',
      left: '5%',
      right: '5%'
    },
    series: [{
      type: 'scatter',
      data: bubbleData,
      symbolSize: function(val) {
        return getSymbolSize(val[2])
      },
      z: 2,
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          color: '#FFD700',
          formatter: function(params) {
            return `${params.data.name}: 评分 ${params.data.value[2]}`
          }
        },
        itemStyle: {
          borderColor: '#FFD700',
          borderWidth: 2,
          opacity: 1
        },
        symbolSize: function(val) {
          return getSymbolSize(val[2]) * 1.5
        }
      },
      itemStyle: {
        cursor: 'pointer'  // 在series级别也添加鼠标指针样式
      },
      animationEasing: 'easeInOutQuad',
      animationDuration: 5000
    }]
  }

  // 设置点击事件
  chart.on('click', function(params) {
    if (params.componentType === 'series') {
      const url = coachUrls[params.name]
      if (url) {
        console.log('导航到:', url)
        // 这里可以使用 router.push 进行导航
      }
    }
  })

  // 修改 series 配置，添加鼠标样式
  option.series[0].itemStyle.cursor = 'pointer'

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
  min-height: 300px;
  background: transparent;
}
</style>