<template>
  <div class="stats-cards">
    <el-row :gutter="20">
      <el-col :span="6" v-for="(card, index) in statsCards" :key="index">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-label">{{ card.label }}</div>
            <div class="stats-value">{{ formatValue(card.value, card.prefix) }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

interface StatsCard {
  label: string
  value: number
  prefix?: string
}

const props = defineProps<{
  statsCards: StatsCard[]
}>()

// 格式化展示值
const formatValue = (value: number, prefix?: string) => {
  const formattedValue = value.toLocaleString()
  return prefix ? `${prefix} ${formattedValue}` : formattedValue
}
</script>

<style scoped>
.stats-cards {
  margin-bottom: 20px;
}

.stats-card {
  transition: all 0.3s ease;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stats-content {
  text-align: center;
}

.stats-label {
  font-size: 16px;
  color: #606266;
  margin-bottom: 10px;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}
</style>
