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
        <!-- 待办事项区域 -->
        <div class="todo-section">
          <div class="section-header">
            <h2>待办事项</h2>
            <el-button type="primary" size="small" @click="showAddTodoDialog = true">
              <el-icon>
                <plus />
              </el-icon>添加待办
            </el-button>
          </div>

          <el-table :data="todoList" style="width: 100%" v-loading="loading.todo">
            <el-table-column label="内容" prop="content" min-width="220" />
            <el-table-column label="截止时间" width="180" align="center">
              <template #default="{ row }">
                今天 {{ row.deadline.split(' ')[1].substring(0, 5) }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="120" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.status === 0" type="warning" effect="plain">进行中</el-tag>
                <el-tag v-else-if="row.status === 1" type="success" effect="plain">已完成</el-tag>
                <el-tag v-else type="info" effect="plain">已取消</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" align="center">
              <template #default="{ row }">
                <template v-if="row.status === 0">
                  <el-button size="small" type="success" @click="updateTodoStatus(row.id, 1)">完成</el-button>
                  <el-button size="small" plain @click="updateTodoStatus(row.id, 2)">取消</el-button>
                </template>
                <template v-else-if="row.status === 1">
                  <el-button size="small" plain disabled>已结束</el-button>
                </template>
                <template v-else>
                  <el-button size="small" plain disabled>已结束</el-button>
                </template>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 统计卡片区域 -->
        <div class="stats-cards">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-card shadow="hover" class="stats-card">
                <div class="stats-content">
                  <div class="stats-label">总用户数</div>
                  <div class="stats-value">{{ statsData.totalUsers.toLocaleString() }}</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="stats-card">
                <div class="stats-content">
                  <div class="stats-label">今日活跃</div>
                  <div class="stats-value">{{ statsData.todayActive.toLocaleString() }}</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="stats-card">
                <div class="stats-content">
                  <div class="stats-label">订单总量</div>
                  <div class="stats-value">{{ statsData.totalOrders.toLocaleString() }}</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="stats-card">
                <div class="stats-content">
                  <div class="stats-label">营收总额</div>
                  <div class="stats-value">¥ {{ statsData.totalRevenue.toLocaleString() }}</div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 图表区域 -->
        <div class="chart-section">
          <el-row :gutter="20">
            <el-col :span="16">
              <el-card shadow="hover" class="chart-card">
                <div class="chart-title">近七日用户增长趋势</div>
                <div class="chart-container" id="userGrowthChart"></div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover" class="chart-card">
                <div class="chart-title">用户分布</div>
                <div class="chart-container" id="userDistributionChart"></div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>

    <!-- 添加待办对话框 -->
    <el-dialog v-model="showAddTodoDialog" title="添加待办事项" width="500px">
      <el-form :model="todoForm" ref="todoFormRef" :rules="todoRules" label-width="100px">
        <el-form-item label="待办内容" prop="content">
          <el-input v-model="todoForm.content" placeholder="请输入待办内容"></el-input>
        </el-form-item>
        <el-form-item label="截止时间" prop="deadline">
          <el-date-picker v-model="todoForm.deadline" type="datetime" placeholder="选择截止时间" format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddTodoDialog = false">取消</el-button>
          <el-button type="primary" @click="submitTodoForm" :loading="loading.addTodo">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { getDashboardStats, getUserGrowthTrend, getUserDistribution, updateTodoStatus as updateTodoApi, addTodoItem } from '@/api/modules/dashboard'
import { TodoItem, TodoItemForm } from '@/types/dashboard'
import { QueryTodoParams, TodoStatus, CreateTodoParams, UpdateTodoStatusParams } from '@/types/todo'
import { ElMessage, FormInstance } from 'element-plus'
import * as echarts from 'echarts'
import { useRouter } from 'vue-router'

// 用户信息
const userStore = useUserStore()
const userInfo = userStore.userInfo || { username: '陈总监', nickname: '' }

// 时间和天气信息
const weather = reactive({
  temperature: '25',
  condition: '晴朗'
})

// 当前时间
const currentTime = ref('06:39')
const timerInterval = ref<ReturnType<typeof setInterval> | null>(null)

// 加载状态
const loading = reactive({
  stats: false,
  todo: false,
  charts: false,
  addTodo: false
})

// 统计数据
const statsData = reactive({
  totalUsers: 12846,
  todayActive: 2534,
  totalOrders: 8942,
  totalRevenue: 284394
})

// 待办事项
const todoList = ref<TodoItem[]>([
  {
    id: '1',
    content: '项目周报提交',
    deadline: '2024-05-02 14:00:00',
    status: 0,
    createdAt: '2024-05-01 10:00:00'
  },
  {
    id: '2',
    content: '产品设计评审会议',
    deadline: '2024-05-02 15:30:00',
    status: 0,
    createdAt: '2024-05-01 09:30:00'
  },
  {
    id: '3',
    content: '团队代码审核',
    deadline: '2024-05-02 16:00:00',
    status: 1,
    createdAt: '2024-05-01 14:20:00'
  },
  {
    id: '4',
    content: '新功能发布计划制定',
    deadline: '2024-05-02 17:00:00',
    status: 0,
    createdAt: '2024-05-01 11:00:00'
  }
])

// 图表实例
let userGrowthChart: echarts.ECharts | null = null
let userDistributionChart: echarts.ECharts | null = null

// 添加待办表单
const showAddTodoDialog = ref(false)
const todoFormRef = ref<FormInstance>()
const todoForm = reactive<TodoItemForm>({
  content: '',
  deadline: ''
})

// 表单验证规则
const todoRules = {
  content: [
    { required: true, message: '请输入待办内容', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  deadline: [
    { required: true, message: '请选择截止时间', trigger: 'change' }
  ]
}

// 更新待办状态
const updateTodoStatus = async (id: string, status: number) => {
  try {
    await updateTodoApi(id, status)
    // 更新本地数据
    const index = todoList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      todoList.value[index].status = status
    }
    ElMessage.success(status === 1 ? '已完成待办事项' : '已取消待办事项')
  } catch (error) {
    console.error('更新待办状态失败:', error)
    ElMessage.error('操作失败，请重试')
  }
}

// 提交添加待办表单
const submitTodoForm = async () => {
  if (!todoFormRef.value) return

  await todoFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.addTodo = true
        const { data } = await addTodoItem(todoForm)
        if (data) {
          todoList.value.unshift(data)
          ElMessage.success('添加待办事项成功')
          showAddTodoDialog.value = false
          // 重置表单
          todoForm.content = ''
          todoForm.deadline = ''
        }
      } catch (error) {
        console.error('添加待办事项失败:', error)
        ElMessage.error('添加失败，请重试')
      } finally {
        loading.addTodo = false
      }
    }
  })
}

// 初始化用户增长趋势图表
const initUserGrowthChart = async () => {
  // 初始化图表
  if (!userGrowthChart) {
    userGrowthChart = echarts.init(document.getElementById('userGrowthChart'))
  }

  // 截图中的数据
  const xAxisData = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const seriesData = [850, 930, 900, 930, 1250, 1300, 1290]

  // 配置图表
  userGrowthChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#e0e0e0'
        }
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#666'
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0'
        }
      },
      min: 0,
      max: 1500,
      interval: 300
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: seriesData,
        itemStyle: {
          color: '#6366f1'
        },
        lineStyle: {
          width: 3,
          color: '#6366f1'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
            { offset: 1, color: 'rgba(99, 102, 241, 0.05)' }
          ])
        }
      }
    ]
  })
}

// 初始化用户分布图表
const initUserDistributionChart = async () => {
  // 初始化图表
  if (!userDistributionChart) {
    userDistributionChart = echarts.init(document.getElementById('userDistributionChart'))
  }

  // 截图中的数据
  const pieData = [
    { name: '企业用户', value: 1250 },
    { name: '个人用户', value: 1050 },
    { name: 'VIP用户', value: 860 },
    { name: '试用用户', value: 501 }
  ]

  // 配置图表
  userDistributionChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      right: 'center',
      bottom: 0,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        color: '#666'
      },
      data: pieData.map(item => item.name)
    },
    series: [
      {
        name: '用户分布',
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}',
          color: '#666'
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 10
        },
        itemStyle: {
          borderRadius: 4
        },
        color: ['#6366f1', '#84cc16', '#f59e0b', '#f43f5e'],
        data: pieData
      }
    ]
  })
}

// 重新绘制图表（窗口大小变化时）
const resizeCharts = () => {
  userGrowthChart?.resize()
  userDistributionChart?.resize()
}

// 更新时间函数
const updateTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}`
}

// 测试路由功能
function testSystemMenuRoute() {
  const hasRoute = router.hasRoute('Menu')
  const allRoutes = router.getRoutes()
  const systemRoutes = allRoutes.filter(r => r.path.includes('system'))

  console.log('菜单管理路由存在:', hasRoute)
  console.log('所有系统路由:', systemRoutes)

  alert(`菜单管理路由存在: ${hasRoute}\n系统路由数量: ${systemRoutes.length}`)
}

const router = useRouter()

onMounted(async () => {
  console.log('仪表盘组件已加载')

  // 设置时间更新
  updateTime()
  timerInterval.value = setInterval(updateTime, 60000)

  // 等DOM渲染完成后初始化图表
  setTimeout(() => {
    initUserGrowthChart()
    initUserDistributionChart()
  }, 100)

  // 添加窗口调整监听
  window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
  // 清除定时器
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }

  // 销毁图表实例
  userGrowthChart?.dispose()
  userDistributionChart?.dispose()

  // 移除窗口调整监听
  window.removeEventListener('resize', resizeCharts)
})
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 20px;

  .welcome-section {
    margin-bottom: 24px;
    position: relative;
    background-color: #fff;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;

    .dashboard-title {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 24px;
    }

    .welcome-text {
      font-size: 16px;
      color: #666;
      margin: 0;
    }

    .time-weather {
      position: absolute;
      right: 20px;
      top: 20px;
      text-align: right;

      .time {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 4px;
      }

      .weather-info {
        font-size: 14px;
        color: #666;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 5px;
      }
    }
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }

  .todo-section {
    background-color: #fff;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
  }

  .stats-cards {
    margin-bottom: 20px;

    .stats-card {
      height: 120px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;

      .stats-content {
        text-align: center;
      }

      .stats-label {
        font-size: 16px;
        color: #666;
        margin-bottom: 10px;
      }

      .stats-value {
        font-size: 28px;
        font-weight: bold;
        color: #333;
      }
    }
  }

  .chart-section {
    .chart-card {
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
      padding: 15px;

      .chart-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-bottom: 15px;
      }

      .chart-container {
        height: 300px;
        width: 100%;
      }
    }
  }
}

// 表格样式调整
:deep(.el-table) {
  --el-table-header-bg-color: #f7f8fa;
  --el-table-row-hover-bg-color: #f5f7fa;

  .el-table__header th {
    font-weight: 600;
    color: #333;
  }

  .el-button--small {
    padding: 6px 12px;
  }
}

// 标签样式调整
:deep(.el-tag) {
  padding: 0 8px;
  height: 24px;
  line-height: 22px;

  &.el-tag--warning {
    --el-tag-bg-color: rgba(250, 173, 20, 0.1);
    --el-tag-border-color: rgba(250, 173, 20, 0.2);
    --el-tag-text-color: #faad14;
  }

  &.el-tag--success {
    --el-tag-bg-color: rgba(82, 196, 26, 0.1);
    --el-tag-border-color: rgba(82, 196, 26, 0.2);
    --el-tag-text-color: #52c41a;
  }
}
</style>
