<template>
  <div class="config-table">
    <el-table v-loading="loading" :data="configList" border stripe style="width: 100%" row-key="id">
      <el-table-column label="序号" type="index" width="80" align="center" />
      <el-table-column prop="moduleName" label="模块名称" min-width="150">
        <template #default="{ row }">
          <el-button text type="primary" @click="handleView(row.id)">
            {{ row.moduleName }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column prop="tableName" label="表名" min-width="150" />
      <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
      <el-table-column prop="author" label="作者" width="120" />
      <el-table-column prop="updatedAt" label="更新时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.updatedAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="isGenerated" label="已生成" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.isGenerated ? 'success' : 'info'">
            {{ row.isGenerated ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="300" align="center">
        <template #default="{ row }">
          <el-button v-if="row.isGenerated" type="success" size="small" @click="handlePreview(row.id)">
            预览
          </el-button>
          <el-button type="primary" size="small" @click="handleGenerate(row.id)">
            {{ row.isGenerated ? '重新生成' : '生成代码' }}
          </el-button>
          <el-dropdown>
            <el-button type="info" size="small">
              更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleView(row.id)">详细信息</el-dropdown-item>
                <el-dropdown-item @click="handleExport(row.id)">导出配置</el-dropdown-item>
                <el-dropdown-item @click="handleDuplicate(row.id)">复制配置</el-dropdown-item>
                <el-dropdown-item divided @click="handleDelete(row.id)">
                  <span style="color: #F56C6C">删除配置</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="[10, 20, 50, 100]" :total="total"
        layout="total, sizes, prev, pager, next, jumper" background @size-change="handleSizeChange"
        @current-change="handlePageChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { GeneratorConfig } from '@/types/generator'

// 格式化日期
const formatDate = (date: Date | string | undefined) => {
  if (!date) return '-'

  if (typeof date === 'string') {
    date = new Date(date)
  }

  return date.toLocaleString()
}

const props = defineProps<{
  configList: GeneratorConfig[]
  total: number
  currentPage: number
  pageSize: number
  loading: boolean
}>()

const emit = defineEmits<{
  'view': [id: number]
  'generate': [id: number]
  'preview': [id: number]
  'delete': [id: number]
  'duplicate': [id: number]
  'export': [id: number]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

// 处理详情查看
const handleView = (id: number) => {
  emit('view', id)
}

// 处理生成代码
const handleGenerate = (id: number) => {
  emit('generate', id)
}

// 处理预览代码
const handlePreview = (id: number) => {
  emit('preview', id)
}

// 处理删除
const handleDelete = (id: number) => {
  emit('delete', id)
}

// 处理复制
const handleDuplicate = (id: number) => {
  emit('duplicate', id)
}

// 处理导出
const handleExport = (id: number) => {
  emit('export', id)
}

// 处理页码变化
const handlePageChange = (page: number) => {
  emit('page-change', page)
}

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  emit('size-change', size)
}
</script>

<style scoped>
.config-table {
  width: 100%;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
