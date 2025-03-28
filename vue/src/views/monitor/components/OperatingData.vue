<template>
  <div class="operating-data">
    <ul>
      <li>
        <span>预约总数</span>
        <p><span>{{ data.volume }}</span> 人</p>
      </li>
      <li>
        <span>今日新增预约</span>
        <p><span>{{ data.amount }}</span> 人</p>
      </li>
      <li>
        <span>课程使用率</span>
        <p><span>{{ data.rate }}</span> %</p>
      </li>
      <li>
        <span>同比增长率</span>
        <p><span>{{ data.growth }}</span> %</p>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const data = ref({
  volume: 1000,
  amount: 1000,
  rate: 95,
  growth: 5
})
</script>

<style scoped>
.operating-data {
  background: rgba(255,255,255,0.05);
  padding: 20px;
  border-radius: 4px;
}

.operating-data ul {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.operating-data li {
  text-align: center;
}

.operating-data li span {
  color: #909399;
  font-size: 14px;
}

.operating-data li p {
  font-size: 24px;
  margin: 10px 0;
  color: #409EFF;
}
</style>