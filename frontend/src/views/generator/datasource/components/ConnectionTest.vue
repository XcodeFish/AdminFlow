<template>
  <div class="connection-test">
    <el-button type="primary" @click="handleTest" :loading="testing" :disabled="!canTest">
      测试连接
    </el-button>

    <div v-if="connectionStatus" class="connection-result" :class="resultClass">
      <el-icon v-if="connectionStatus.success">
        <Check />
      </el-icon>
      <el-icon v-else>
        <Close />
      </el-icon>
      <span class="result-message">{{ connectionStatus.message }}</span>
      <span class="result-time" v-if="testDuration > 0">
        (耗时: {{ testDuration }}ms)
      </span>

      <div class="connection-details" v-if="connectionStatus.success && connectionStatus.details">
        <div class="detail-item">
          <span class="label">数据库:</span>
          <span class="value">{{ formatDatabaseType }}</span>
        </div>
        <div class="detail-item">
          <span class="label">版本:</span>
          <span class="value">{{ connectionStatus.details.version || '-' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue'
import { Check, Close } from '@element-plus/icons-vue'
import type { DatasourceTestDto, ConnectionStatus } from '@/types/generator'

const props = defineProps({
  // 表单数据，用于获取连接信息
  formData: {
    type: Object as () => Partial<DatasourceTestDto>,
    required: true
  },
  // 测试中状态
  testing: {
    type: Boolean,
    default: false
  },
  // 连接状态
  connectionStatus: {
    type: Object as () => ConnectionStatus | null,
    default: null
  },
  // 测试耗时
  testDuration: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['test'])

/**
 * 是否可以测试连接
 */
const canTest = computed(() => {
  const { type, host, port, database, username, password } = props.formData
  return !!(type && host && port && database && username && password)
})

/**
 * 数据库类型格式化
 */
const formatDatabaseType = computed(() => {
  const { type } = props.formData
  if (!type) return '-'

  const typeMap: Record<string, string> = {
    mysql: 'MySQL',
    postgresql: 'PostgreSQL',
    oracle: 'Oracle',
    sqlserver: 'SQL Server',
    mongodb: 'MongoDB',
    sqlite: 'SQLite'
  }
  return typeMap[type] || type
})

/**
 * 结果样式类
 */
const resultClass = computed(() => {
  if (!props.connectionStatus) return ''
  return props.connectionStatus.success ? 'success' : 'error'
})

/**
 * 处理测试连接
 */
const handleTest = () => {
  if (!canTest.value || props.testing) return

  emit('test', props.formData)
}
</script>

<style scoped>
.connection-test {
  margin: 15px 0;
}

.connection-result {
  margin-top: 12px;
  padding: 10px 15px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.success {
  background-color: #f0f9eb;
  color: #67c23a;
  border: 1px solid #e1f3d8;
}

.error {
  background-color: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fde2e2;
}

.result-message {
  margin-left: 8px;
  font-weight: 500;
}

.result-time {
  margin-left: 8px;
  font-size: 12px;
  opacity: 0.8;
}

.connection-details {
  width: 100%;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
}

.detail-item {
  display: flex;
  margin-top: 4px;
}

.label {
  width: 60px;
  opacity: 0.8;
}
</style>
