<template>
  <el-drawer v-model="visible" title="配置详情" size="50%" destroy-on-close :before-close="handleClose">
    <template #header>
      <h4>{{ config?.moduleName }} 配置详情</h4>
    </template>

    <template v-if="config">
      <div class="config-detail-container">
        <el-descriptions :column="1" border class="basic-info">
          <el-descriptions-item label="模块名称">{{ config.moduleName }}</el-descriptions-item>
          <el-descriptions-item label="表名">{{ config.tableName }}</el-descriptions-item>
          <el-descriptions-item label="描述">{{ config.description }}</el-descriptions-item>
          <el-descriptions-item label="数据源ID">{{ config.datasourceId }}</el-descriptions-item>
          <el-descriptions-item label="API前缀">{{ config.apiPrefix }}</el-descriptions-item>
          <el-descriptions-item label="包名">{{ config.packageName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="模板类型">{{ config.templateType }}</el-descriptions-item>
          <el-descriptions-item label="作者">{{ config.author }}</el-descriptions-item>
          <el-descriptions-item label="已生成">
            <el-tag :type="config.isGenerated ? 'success' : 'info'">
              {{ config.isGenerated ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="生成时间">
            {{ config.generatedAt ? formatDate(config.generatedAt) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(config.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDate(config.updatedAt) }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">字段配置</el-divider>

        <el-table :data="config.fields" border stripe>
          <el-table-column prop="name" label="字段名" min-width="120" />
          <el-table-column prop="comment" label="说明" min-width="150" show-overflow-tooltip />
          <el-table-column prop="type" label="数据类型" width="120" />
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
          <el-table-column prop="queryType" label="查询方式" width="120" />
        </el-table>

        <el-divider content-position="left">页面配置</el-divider>

        <el-descriptions :column="2" border class="page-config">
          <el-descriptions-item label="列表标题" :span="2">
            {{ config.pageConfig.list.title }}
          </el-descriptions-item>
          <el-descriptions-item label="显示复选框">
            {{ config.pageConfig.list.showCheckbox ? '是' : '否' }}
          </el-descriptions-item>
          <el-descriptions-item label="显示分页">
            {{ config.pageConfig.list.showPagination ? '是' : '否' }}
          </el-descriptions-item>
          <el-descriptions-item label="页大小">
            {{ config.pageConfig.list.pageSize }}
          </el-descriptions-item>
          <el-descriptions-item label="显示操作栏">
            {{ config.pageConfig.list.showOperation ? '是' : '否' }}
          </el-descriptions-item>
          <el-descriptions-item label="操作按钮" :span="2">
            <el-tag v-for="op in config.pageConfig.list.operations" :key="op" class="operation-tag">
              {{ op }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">表单配置</el-divider>

        <el-descriptions :column="2" border class="form-config">
          <el-descriptions-item label="表单宽度">
            {{ config.pageConfig.form.width }}
          </el-descriptions-item>
          <el-descriptions-item label="标签宽度">
            {{ config.pageConfig.form.labelWidth }}
          </el-descriptions-item>
          <el-descriptions-item label="标签位置">
            {{ config.pageConfig.form.labelPosition }}
          </el-descriptions-item>
          <el-descriptions-item label="表单大小">
            {{ config.pageConfig.form.size }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">权限配置</el-divider>

        <el-descriptions :column="2" border class="permission-config">
          <el-descriptions-item label="查看权限">
            {{ config.pageConfig.permissions.list || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建权限">
            {{ config.pageConfig.permissions.create || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="更新权限">
            {{ config.pageConfig.permissions.update || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="删除权限">
            {{ config.pageConfig.permissions.delete || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="导入权限">
            {{ config.pageConfig.permissions.import || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="导出权限">
            {{ config.pageConfig.permissions.export || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </template>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="handleGenerate" :disabled="!config">
          {{ config?.isGenerated ? '重新生成' : '生成代码' }}
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, watch, ref, computed } from 'vue'
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
  modelValue: boolean
  config: GeneratorConfig | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
  'generate': [id: number]
}>()

// 抽屉可见性的计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 关闭抽屉
const handleClose = () => {
  visible.value = false
  emit('close')
}

// 生成代码
const handleGenerate = () => {
  if (props.config) {
    emit('generate', props.config.id)
  }
}
</script>

<style scoped>
.config-detail-container {
  padding: 10px;
}

.basic-info,
.page-config,
.form-config,
.permission-config {
  margin-bottom: 20px;
}

.el-divider {
  margin: 24px 0;
}

.operation-tag {
  margin-right: 5px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
