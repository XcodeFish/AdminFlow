<template>
  <div class="test-page">
    <h1>测试页面 - 路由工作正常</h1>
    <p>如果您能看到这个页面，说明路由系统能够正确加载页面。</p>
    <el-button type="primary" @click="$router.push('/dashboard')">返回仪表盘</el-button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('测试页面已加载')
})
</script>

<style scoped>
.test-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

h1 {
  margin-bottom: 20px;
  color: #409EFF;
}
</style>
