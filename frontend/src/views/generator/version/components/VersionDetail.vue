<template>
  <el-dialog v-model="visible" title="版本详情" width="650px" :close-on-click-modal="false" destroy-on-close>
    <div v-loading="loading" class="version-detail">
      <template v-if="version">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="版本号" :span="2">{{ version.version }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ version.creator }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(version.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="版本说明" :span="2">
            {{ version.description }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="divider">
          <el-divider content-position="left">快照信息</el-divider>
        </div>

        <!-- 版本快照信息 -->
        <template v-if="version.snapshot">
          <!-- 基本信息 -->
          <div class="section">
            <h3>基本信息</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="模块名称">
                {{ version.snapshot.moduleName }}
              </el-descriptions-item>
              <el-descriptions-item label="表名">
                {{ version.snapshot.tableName }}
              </el-descriptions-item>
              <el-descriptions-item label="API前缀">
                {{ version.snapshot.apiPrefix }}
              </el-descriptions-item>
              <el-descriptions-item label="包名">
                {{ version.snapshot.packageName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="描述" :span="2">
                {{ version.snapshot.description }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 字段信息 -->
          <div class="section">
            <h3>字段信息</h3>
            <el-table :data="version.snapshot.fields" border stripe>
              <el-table-column prop="name" label="字段名" min-width="120" />
              <el-table-column prop="type" label="数据类型" width="100" />
              <el-table-column prop="component" label="组件类型" width="120" />
              <el-table-column label="列表显示" width="80" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.showInList ? 'success' : 'info'" size="small">
                    {{ row.showInList ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="表单显示" width="80" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.showInForm ? 'success' : 'info'" size="small">
                    {{ row.showInForm ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="查询条件" width="80" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.showInSearch ? 'success' : 'info'" size="small">
                    {{ row.showInSearch ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
        <el-empty v-else description="无快照信息" />
      </template>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="warning" @click="handleRollback">回滚到此版本</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'
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
  loading: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'rollback': [id: number]
}>()

// 对话框可见性的计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 关闭对话框
const handleClose = () => {
  visible.value = false
}

// 回滚到此版本
const handleRollback = () => {
  if (props.version) {
    emit('rollback', props.version.id)
    visible.value = false
  }
}
</script>

<style scoped>
.version-detail {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 10px;
}

.divider {
  margin: 20px 0;
}

.section {
  margin-bottom: 20px;
}

h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
