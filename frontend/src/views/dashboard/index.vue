<template>
  <div class="dashboard">
    <!-- 欢迎信息区域 -->
    <div class="dashboard__welcome">
      <div class="welcome-card">
        <div class="welcome-content">
          <div class="welcome-info">
            <h1 class="welcome-title">欢迎使用 Admin Flow 系统</h1>
            <p class="welcome-subtitle">早上好，{{ userInfo.nickname || userInfo.username }}，祝您开心每一天！</p>
          </div>
          <div class="welcome-time-weather">
            <time-display />
            <div class="welcome-weather">
              {{ weather.temperature }}°C / {{ weather.condition }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <div class="dashboard__stats">
      <stat-card title="总用户数" :value="statsData.totalUsers.toLocaleString()" icon="User" type="primary" />
      <stat-card title="今日活跃" :value="statsData.todayActive.toLocaleString()" icon="View" type="success" />
      <stat-card title="订单总量" :value="statsData.totalOrders.toLocaleString()" icon="Tickets" type="warning" />
      <stat-card title="营收总额" :value="`¥${statsData.totalRevenue.toLocaleString()}`" icon="Money" type="danger" />
    </div>

    <!-- 待办事项区域 -->
    <div class="dashboard__todos">
      <todo-list title="待办事项" :items="todoItems" @refresh="fetchTodoList" />
    </div>

    <!-- 图表区域 -->
    <div class="dashboard__charts">
      <div class="dashboard__chart-item">
        <trend-chart title="近七日用户增长趋势" :xAxis="growthData.dates" :series="[
          {
            name: '新增用户',
            data: growthData.counts,
            color: '#1890ff'
          }
        ]">
          <template #actions>
            <el-button-group>
              <el-button size="small" @click="fetchUserGrowth(7)">7天</el-button>
              <el-button size="small" @click="fetchUserGrowth(15)">15天</el-button>
              <el-button size="small" @click="fetchUserGrowth(30)">30天</el-button>
            </el-button-group>
          </template>
        </trend-chart>
      </div>

      <div class="dashboard__chart-item">
        <pie-chart title="用户分布" :data="distributionData" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, defineComponent, h } from 'vue'
import { useUserStore } from '@/store/modules/user'
import {
  getDashboardStats,
  getUserGrowthTrend,
  getUserDistribution,
  getTodoList
} from '@/api/modules/dashboard'
import type {
  DashboardStats,
  UserGrowthData,
  UserDistributionData,
  TodoItem
} from '@/types/dashboard'
import StatCard from '@/components/business/dashboard/StatCard.vue'
import TrendChart from '@/components/business/dashboard/TrendChart.vue'
import PieChart from '@/components/business/dashboard/PieChart.vue'
import TodoList from '@/components/business/dashboard/TodoList.vue'
import TimeDisplay from '@/components/business/common/TimeDisplay.vue'

// 用户信息
const userStore = useUserStore()
const userInfo = userStore.userInfo || { username: '用户', nickname: '' }

// 时间和天气信息
const weather = reactive({
  temperature: '25',
  condition: '晴朗'
})

// 统计数据
const statsData = reactive<DashboardStats>({
  totalUsers: 0,
  todayActive: 0,
  totalOrders: 0,
  totalRevenue: 0
})

// 增长趋势数据
const growthData = reactive({
  dates: [] as string[],
  counts: [] as number[]
})

// 用户分布数据
const distributionData = ref<Array<{ name: string, value: number, itemStyle?: { color: string } }>>([])

// 待办事项列表
const todoItems = ref<TodoItem[]>([])

// 加载统计数据
const fetchStats = async () => {
  try {
    const { data } = await getDashboardStats()
    Object.assign(statsData, data)
  } catch (error) {
    console.error('获取统计数据失败', error)
  }
}

// 加载用户增长趋势
const fetchUserGrowth = async (days = 7) => {
  try {
    const { data } = await getUserGrowthTrend(days)
    growthData.dates = data.map((item: UserGrowthData) => item.date)
    growthData.counts = data.map((item: UserGrowthData) => item.count)
  } catch (error) {
    console.error('获取用户增长趋势失败', error)
  }
}

// 加载用户分布数据
const fetchUserDistribution = async () => {
  try {
    const { data } = await getUserDistribution()

    // 颜色映射
    const colorMap: Record<string, string> = {
      '企业用户': '#5470c6',
      '个人用户': '#91cc75',
      'VIP用户': '#fac858',
      '试用用户': '#ee6666'
    }

    distributionData.value = data.map((item: UserDistributionData) => ({
      name: item.type,
      value: item.value,
      itemStyle: {
        color: colorMap[item.type] || '#73c0de'
      }
    }))
  } catch (error) {
    console.error('获取用户分布数据失败', error)
  }
}

// 加载待办事项
const fetchTodoList = async () => {
  try {
    const { data } = await getTodoList()
    todoItems.value = data
  } catch (error) {
    console.error('获取待办事项失败', error)
  }
}

// 页面初始化
onMounted(async () => {
  await fetchStats()
  await fetchUserGrowth()
  await fetchUserDistribution()
  await fetchTodoList()
})
</script>

<style lang="scss" scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  &__welcome {
    margin-bottom: 0.5rem;

    .welcome-card {
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;

      .welcome-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .welcome-info {
        flex: 1;
      }

      .welcome-time-weather {
        text-align: right;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.5rem;
      }
    }

    .welcome-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .welcome-subtitle {
      color: #666;
      margin-bottom: 0;
    }

    .welcome-weather {
      display: flex;
      align-items: center;
      font-size: 1rem;
      color: #444;
    }
  }

  &__stats {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;

    @media (min-width: 640px) {
      grid-template-columns: 1fr 1fr;
    }

    @media (min-width: 1024px) {
      grid-template-columns: 1fr 1fr 1fr 1fr;
    }
  }

  &__todos {
    margin-bottom: 1.5rem;
  }

  &__charts {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;

    @media (min-width: 1024px) {
      grid-template-columns: 1fr 1fr;
    }
  }

  &__chart-item {
    flex: 1;
  }
}
</style>
