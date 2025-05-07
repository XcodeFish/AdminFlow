<template>
  <el-drawer v-model="visible" :title="drawerTitle" size="70%" :before-close="handleClose" append-to-body
    destroy-on-close>
    <template #header>
      <div class="drawer-header">
        <span class="drawer-title">{{ drawerTitle }}</span>
        <div class="drawer-actions">
          <el-button type="primary" @click="handleImport" :loading="loading" :disabled="!tableDetail">
            导入到代码生成器
          </el-button>
        </div>
      </div>
    </template>

    <div v-loading="loading" class="table-detail">
      <template v-if="tableDetail">
        <!-- 表基本信息 -->
        <el-card class="base-info-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>

          <el-descriptions :column="3" border>
            <el-descriptions-item label="表名">
              <strong>{{ tableDetail.tableName }}</strong>
            </el-descriptions-item>
            <el-descriptions-item label="引擎">
              {{ tableDetail.engine || 'N/A' }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDateTime(tableDetail.createTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="表注释" :span="2">
              {{ tableDetail.tableComment || '无' }}
            </el-descriptions-item>
            <el-descriptions-item label="主键">
              <el-tag type="danger">{{ tableDetail.primaryKey || '无' }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 字段列表 -->
        <el-card class="column-card">
          <template #header>
            <div class="card-header">
              <span>字段列表</span>
              <span class="column-count">{{ tableDetail.columns?.length || 0 }} 个字段</span>
            </div>
          </template>

          <ColumnList :columns="tableDetail.columns || []" :loading="loading" />
        </el-card>

        <!-- 索引信息 -->
        <el-card class="index-card" v-if="tableDetail.indexes && tableDetail.indexes.length > 0">
          <template #header>
            <div class="card-header">
              <span>索引信息</span>
              <span class="index-count">{{ tableDetail.indexes?.length || 0 }} 个索引</span>
            </div>
          </template>

          <el-table :data="tableDetail.indexes" style="width: 100%" border stripe>
            <el-table-column prop="name" label="索引名称" min-width="200" />
            <el-table-column prop="type" label="索引类型" width="120">
              <template #default="{ row }">
                <el-tag size="small">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="columns" label="索引字段" min-width="250">
              <template #default="{ row }">
                <el-tag size="small" type="success" v-for="(col, index) in row.columns" :key="index"
                  class="index-column-tag">
                  {{ col }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </template>

      <el-empty v-else description="暂无表详情数据" />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed, watch } from 'vue'
import ColumnList from './ColumnList.vue'
import type { TableDetail as TableDetailType } from '@/types/generator'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  tableDetail: {
    type: Object as () => TableDetailType | null,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:modelValue',
  'close',
  'import'
])

/**
 * 可见性同步
 */
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

/**
 * 抽屉标题
 */
const drawerTitle = computed(() => {
  if (!props.tableDetail) return '表结构详情'

  let title = `表结构详情: ${props.tableDetail.tableName}`
  if (props.tableDetail.tableComment) {
    title += ` (${props.tableDetail.tableComment})`
  }

  return title
})

/**
 * 处理关闭
 */
const handleClose = () => {
  emit('close')
}

/**
 * 处理导入
 */
const handleImport = () => {
  if (!props.tableDetail) return
  emit('import', props.tableDetail)
}

/**
 * 时间格式化
 */
const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString()
}
</script>

<style scoped>
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.drawer-title {
  font-size: 16px;
  font-weight: 500;
}

.table-detail {
  padding: 0 20px;
}

.base-info-card,
.column-card,
.index-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.column-count,
.index-count {
  font-size: 14px;
  color: #909399;
}

.index-column-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}
</style>
