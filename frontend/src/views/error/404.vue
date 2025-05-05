<template>
  <div class="error-container">
    <div class="error-content">
      <h1 class="error-code">404</h1>
      <div class="error-title">页面不存在</div>
      <div class="error-desc">抱歉，您访问的页面不存在或已被删除</div>
      <div class="error-actions">
        <button class="btn-back" @click="goBack">返回上一页</button>
        <button class="btn-home" @click="goHome">返回首页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.error-content {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 500px;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #909399;
  margin: 0;
  line-height: 1.2;
}

.error-title {
  font-size: 24px;
  color: #303133;
  margin-bottom: 16px;
  font-weight: 500;
}

.error-desc {
  font-size: 16px;
  color: #606266;
  margin-bottom: 24px;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-back,
.btn-home {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-back {
  background-color: #f4f4f5;
  color: #606266;
}

.btn-back:hover {
  background-color: #e9e9eb;
}

.btn-home {
  background-color: #409eff;
  color: white;
}

.btn-home:hover {
  background-color: #66b1ff;
}
</style>
