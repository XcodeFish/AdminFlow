<template>
  <div class="dashboard">
    <!-- 欢迎信息区域 -->
    <div class="welcome-section">
      <h1 class="dashboard-title">欢迎使用 Admin Flow 系统</h1>
      <p class="welcome-text">早上好，{{ userInfo.nickname || userInfo.username }}，祝您开心每一天！</p>
      <div class="time-weather">
        <div class="time">{{ currentTime }}</div>
        <div class="weather-info">
          <span>{{ weather.temperature }}°C / {{ weather.condition }}</span>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- 左侧内容 -->
      <div class="dashboard-main">
        <!-- 待办事项组件 -->
        <TodoList />

        <!-- 统计卡片组件 -->
        <StatCards :statsCards="statsCards" />

        <!-- 图表组件 -->
        <ChartSection />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useUserStore } from '@/store/modules/user'
import TodoList from './components/TodoList.vue'
import StatCards from './components/StatCards.vue'
import ChartSection from './components/ChartSection.vue'
import { useTime } from './hooks/useTime'

// 用户信息
const userStore = useUserStore()
const userInfo = userStore.userInfo || { username: '管理员', nickname: '' }

// 使用时间hook
const { currentTime } = useTime()

// 天气信息
const weather = reactive({
  temperature: '25',
  condition: '晴朗'
})

// 统计卡片数据
const statsCards = [
  { label: '总用户数', value: 12846 },
  { label: '今日活跃', value: 2534 },
  { label: '订单总量', value: 8942 },
  { label: '营收总额', value: 284394, prefix: '¥' }
]
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.welcome-section {
  background-color: #fff;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.dashboard-title {
  font-size: 24px;
  margin-bottom: 10px;
  color: #303133;
}

.welcome-text {
  font-size: 16px;
  color: #606266;
  margin-bottom: 16px;
}

.time-weather {
  display: flex;
  align-items: center;
}

.time {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-right: 20px;
}

.weather-info {
  font-size: 16px;
  color: #606266;
}

.dashboard-content {
  margin-top: 20px;
}
</style>
