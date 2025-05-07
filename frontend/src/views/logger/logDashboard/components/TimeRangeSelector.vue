<template>
  <div class="time-range-selector">
    <el-card shadow="hover">
      <template #header>
        <div class="time-range-header">
          <span>时间范围筛选</span>
          <div class="time-range-actions">
            <el-button-group>
              <el-button size="small" @click="() => handleQuickSelect(1)">今日</el-button>
              <el-button size="small" @click="() => handleQuickSelect(7)">近7天</el-button>
              <el-button size="small" @click="() => handleQuickSelect(30)">近30天</el-button>
            </el-button-group>
          </div>
        </div>
      </template>

      <div class="time-range-content">
        <el-row :gutter="20" class="mb-15">
          <el-col :span="24">
            <el-date-picker :model-value="timeRange" @update:model-value="handleTimeRangeChange" type="datetimerange"
              start-placeholder="开始日期" end-placeholder="结束日期" range-separator="至" value-format="YYYY-MM-DD HH:mm:ss"
              :shortcuts="shortcuts" :clearable="false" style="width: 100%" />
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-select :model-value="timeGranularity" @update:model-value="handleGranularityChange"
              placeholder="请选择时间粒度" style="width: 100%">
              <el-option v-for="item in granularityOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-col>
        </el-row>

        <el-row class="mt-15">
          <el-col :span="24">
            <el-button type="primary" style="width: 100%" :loading="loading" @click="handleSearch">
              应用筛选
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import { TimeGranularity } from '../hooks/useLogDashboard'

// 定义Props和Emits
const props = defineProps<{
  timeRange: [Date, Date]
  timeGranularity: TimeGranularity
  granularityOptions: Array<{ label: string; value: string }>
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'timeRangeChange', dates: [Date, Date]): void
  (e: 'granularityChange', value: TimeGranularity): void
  (e: 'quickSelect', days: number): void
  (e: 'search'): void
}>()

// 日期选择器快捷选项
const shortcuts = [
  {
    text: '今日',
    value: () => {
      const start = new Date(new Date().setHours(0, 0, 0, 0))
      const end = new Date()
      return [start, end]
    }
  },
  {
    text: '过去24小时',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24)
      return [start, end]
    }
  },
  {
    text: '最近7天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近30天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]

// 事件处理函数
const handleTimeRangeChange = (dates: [Date, Date]) => {
  emit('timeRangeChange', dates)
}

const handleGranularityChange = (value: TimeGranularity) => {
  emit('granularityChange', value)
}

const handleQuickSelect = (days: number) => {
  emit('quickSelect', days)
}

const handleSearch = () => {
  emit('search')
}
</script>

<style lang="scss" scoped>
.time-range-selector {
  .time-range-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .time-range-content {
    padding: 5px;
  }

  .mb-15 {
    margin-bottom: 15px;
  }

  .mt-15 {
    margin-top: 15px;
  }
}
</style>
