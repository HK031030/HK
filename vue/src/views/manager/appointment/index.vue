<template>
  <div class="appointment-wrapper">
    <RouterView />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { onMounted } from 'vue';

const route = useRoute();

onMounted(() => {
  console.log('当前预约管理路由:', route.path);
});
</script>

<style scoped>
.appointment-wrapper {
  padding: 20px;
  height: 100%;
}
</style>