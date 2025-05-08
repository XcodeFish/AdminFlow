<template>
  <el-dialog v-model="visible" title="回滚确认" width="500px" :close-on-click-modal="false" :close-on-press-escape="false"
    :show-close="rollbackStatus !== 'processing'" destroy-on-close>
    <div class="rollback-confirm">
      <template v-if="version">
        <el-alert type="warning" :closable="false" title="注意" description="回滚操作将使配置恢复到该版本的状态，此操作不可逆，请谨慎操作。" show-icon />

        <div class="version-info">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="版本号">{{ version.version }}</el-descriptions-item>
            <el-descriptions-item label="创建人">{{ version.creator }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDate(version.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="版本说明">
              {{ version.description }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div v-if="rollbackStatus !== 'idle'" class="progress-container">
          <el-progress :percentage="rollbackProgress" :status="rollbackStatus === 'error' ? 'exception' :
            rollbackStatus === 'success' ? 'success' : ''" />

          <div class="status-text">
            <span v-if="rollbackStatus === 'processing'">正在回滚，请勿关闭窗口...</span>
            <span v-else-if="rollbackStatus === 'success'">回滚成功！</span>
            <span v-else-if="rollbackStatus === 'error'" class="error-text">回滚失败，请重试！</span>
          </div>
        </div>
      </template>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" :disabled="rollbackStatus === 'processing'">
          {{ rollbackStatus === 'success' ? '关闭' : '取消' }}
        </el-button>
        <el-button type="warning" @click="handleRollback" :loading="rollbackStatus === 'processing'"
          :disabled="rollbackStatus === 'processing' || rollbackStatus === 'success'">
          确认回滚
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed, watch } from 'vue'
import type { GeneratorVersion } from '@/types/generator'

// 格式化日期
const formatDate = (date: Date | string | undefined) => {
  if (!date) return '-'

  if (typeof date === 'string') {
    date = new Date(date)
  }

  return date.toLocaleString()
}

const props = defineProps<{
  modelValue: boolean
  version: GeneratorVersion | null
  rollbackProgress: number
  rollbackStatus: 'idle' | 'processing' | 'success' | 'error'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'rollback': [id: number]
  'reset': []
}>()

// 对话框可见性的计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (val) => {
    if (props.rollbackStatus !== 'processing') {
      emit('update:modelValue', val)
    }
  }
})

// 关闭对话框
const handleClose = () => {
  if (props.rollbackStatus === 'processing') return

  visible.value = false
  if (props.rollbackStatus !== 'idle') {
    emit('reset')
  }
}

// 执行回滚
const handleRollback = () => {
  if (props.version && props.rollbackStatus === 'idle') {
    emit('rollback', props.version.id)
  }
}

// 监听状态变化，成功后自动关闭
watch(() => props.rollbackStatus, (status) => {
  if (status === 'success') {
    setTimeout(() => {
      visible.value = false
      emit('reset')
    }, 2000)
  }
})
</script>

<style scoped>
.rollback-confirm {
  margin-bottom: 20px;
}

.version-info {
  margin-top: 20px;
}

.progress-container {
  margin-top: 30px;
}

.status-text {
  margin-top: 10px;
  text-align: center;
  color: #606266;
}

.error-text {
  color: #F56C6C;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
