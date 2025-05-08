<template>
  <div class="basic-info-step">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" class="basic-info-form">
      <!-- 数据源选择 -->
      <el-form-item label="数据源" prop="datasource">
        <el-select v-model="formData.datasource" placeholder="请选择数据源" class="w-full" @change="handleDatasourceChange">
          <el-option v-for="item in datasourceOptions" :key="item.id" :label="item.name" :value="item.id">
            <div class="datasource-option">
              <span>{{ item.name }}</span>
              <span class="text-xs text-gray-500">{{ item.type }} - {{ item.host }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- 表名选择 -->
      <el-form-item label="数据表" prop="tableName">
        <el-select v-model="formData.tableName" placeholder="请选择数据表" class="w-full" filterable :loading="loadingTables"
          :disabled="!formData.datasource" @change="handleTableChange">
          <el-option v-for="item in tableOptions" :key="item.tableName" :label="item.tableName" :value="item.tableName">
            <div class="table-option">
              <span>{{ item.tableName }}</span>
              <span class="text-xs text-gray-500">{{ item.tableComment }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- 模块名称 -->
      <el-form-item label="模块名称" prop="moduleName">
        <el-input v-model="formData.moduleName" placeholder="请输入模块名称，例如：user" />
      </el-form-item>

      <!-- 模块描述 -->
      <el-form-item label="模块描述" prop="moduleDescription">
        <el-input v-model="formData.moduleDescription" placeholder="请输入模块描述，例如：用户管理" />
      </el-form-item>

      <!-- 包名 -->
      <el-form-item label="包名" prop="packageName">
        <el-input v-model="formData.packageName" placeholder="请输入包名，例如：com.adminflow.system" />
      </el-form-item>

      <!-- 作者 -->
      <el-form-item label="作者" prop="author">
        <el-input v-model="formData.author" placeholder="请输入作者姓名" />
      </el-form-item>
    </el-form>

    <!-- 表结构预览 -->
    <div v-if="tableDetail" class="table-preview">
      <div class="preview-header">
        <h3>表结构预览</h3>
        <el-tag size="small">{{ tableDetail.columns.length }} 个字段</el-tag>
      </div>
      <el-table :data="tableDetail.columns" stripe border size="small" max-height="300">
        <el-table-column prop="name" label="字段名" width="180" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="comment" label="注释" width="180" />
        <el-table-column label="属性" width="180">
          <template #default="{ row }">
            <el-tag v-if="row.isPrimary" size="small" type="primary" class="mr-1">主键</el-tag>
            <el-tag v-if="row.isAutoIncrement" size="small" type="success" class="mr-1">自增</el-tag>
            <el-tag v-if="!row.nullable" size="small" type="warning" class="mr-1">必填</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="defaultValue" label="默认值" />
      </el-table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElTable, ElTableColumn, ElTag } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useWizardState } from '../hooks/useWizardState'
import type { Datasource, TableInfo, TableDetail } from '@/types/generator'
import generatorApi from '@/api/modules/generator'

// 获取向导状态
const { wizardData, updateStepData, fetchTableDetail } = useWizardState()

// 表单引用
const formRef = ref<FormInstance>()

// 组件状态
const datasources = ref<Datasource[]>([])
const tables = ref<TableInfo[]>([])
const tableDetail = ref<TableDetail | null>(null)
const loadingDatasources = ref(false)
const loadingTables = ref(false)
const loadingTableDetail = ref(false)

// 表单数据
const formData = reactive({
  datasource: '',
  tableName: '',
  moduleName: wizardData.basicInfo.moduleName || '',
  moduleDescription: wizardData.basicInfo.moduleDescription || '',
  packageName: wizardData.basicInfo.packageName || '',
  author: wizardData.basicInfo.author || '',
  id: 0
})

// 下拉选项
const datasourceOptions = computed(() => {
  return datasources.value.map(item => ({
    id: item.id,
    name: item.name || '未命名数据源',
    type: item.type || '未知类型',
    host: item.host || '未知主机'
  }))
})
const tableOptions = computed(() => tables.value)

// 表单验证规则
const rules = reactive<FormRules>({
  datasource: [
    { required: true, message: '请选择数据源', trigger: 'change' }
  ],
  tableName: [
    { required: true, message: '请选择数据表', trigger: 'change' }
  ],
  moduleName: [
    { required: true, message: '请输入模块名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在2到50个字符', trigger: 'blur' }
  ],
  moduleDescription: [
    { required: true, message: '请输入模块描述', trigger: 'blur' }
  ],
  packageName: [
    { pattern: /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/, message: '包名格式不正确', trigger: 'blur' }
  ],
  author: [
    { required: true, message: '请输入作者姓名', trigger: 'blur' }
  ]
})

// 初始化
onMounted(async () => {
  // 加载所有数据源
  await loadDatasources()

  // 如果有已保存的值，恢复表单状态
  if (wizardData.basicInfo.moduleName) {
    // TODO: 根据已保存状态加载相关数据
  }
})

// 加载数据源列表
const loadDatasources = async () => {
  loadingDatasources.value = true
  try {
    const response = await generatorApi.datasource.getList()
    datasources.value = response.data.items || []
    console.log('datasources', datasources.value)
    // 如果只有一个数据源，自动选择
    if (datasources.value.length === 1) {
      formData.datasource = datasources.value[0].name
      formData.id = datasources.value[0].id
      await handleDatasourceChange(datasources.value[0].id)
    }
  } catch (error) {
    console.error('获取数据源列表失败:', error)
    ElMessage.error('获取数据源列表失败')
  } finally {
    loadingDatasources.value = false
  }
}

// 数据源变更处理
const handleDatasourceChange = async (datasourceId: number) => {
  // 清空表选择和表详情
  formData.tableName = ''
  tableDetail.value = null

  // 加载表列表
  if (datasourceId) {
    loadingTables.value = true
    try {
      const response = await generatorApi.table.getList(datasourceId)
      tables.value = response.data.items || []
      console.log('tables', tables.value)
    } catch (error) {
      console.error('获取表列表失败:', error)
      ElMessage.error('获取表列表失败')
    } finally {
      loadingTables.value = false
    }
  } else {
    tables.value = []
  }

  // 将当前数据源ID保存到向导状态
  updateStepData('datasource', { datasourceId })
}

// 表变更处理
const handleTableChange = async (tableName: string) => {
  // 清空表详情
  tableDetail.value = null

  // 如果表名为空，不处理
  if (!tableName || !formData.datasource) return

  // 加载表详情
  loadingTableDetail.value = true
  try {
    // 获取表详情
    const detail = await fetchTableDetail(formData.id, tableName)

    // 更新表详情
    tableDetail.value = detail

    // 如果表详情加载成功，自动设置默认模块名和描述（如果未设置）
    if (detail && !formData.moduleName) {
      // 将表名转换为驼峰命名
      const camelName = tableName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      formData.moduleName = camelName
    }

    if (detail && !formData.moduleDescription) {
      // 使用表注释作为模块描述
      formData.moduleDescription = detail.tableComment || formData.moduleName + '管理'
    }
  } catch (error) {
    console.error('获取表详情失败:', error)
    ElMessage.error('获取表详情失败')
  } finally {
    loadingTableDetail.value = false
  }
}

// 保存表单数据到向导状态
const saveFormData = async () => {
  console.log('当前表单数据:', formData) // 添加此行调试

  try {
    const valid = await formRef.value?.validate()
    if (valid) {
      // 确保表单数据被正确处理
      updateStepData('basicInfo', {
        moduleName: formData.moduleName.trim(), // 确保去除前后空格
        moduleDescription: formData.moduleDescription,
        packageName: formData.packageName,
        author: formData.author
      })

      return true
    } else {
      console.error('表单验证失败')
      return false
    }
  } catch (error) {
    console.error('表单验证出错:', error)
    return false
  }
}

// 暴露公共方法给父组件
defineExpose({
  saveFormData
})
</script>

<style lang="scss" scoped>
.basic-info-step {
  padding: 16px;

  .basic-info-form {
    max-width: 600px;
  }

  .w-full {
    width: 100%;
  }

  .text-xs {
    font-size: 12px;
  }

  .text-gray-500 {
    color: var(--el-text-color-secondary);
  }

  .mr-1 {
    margin-right: 4px;
  }

  .datasource-option,
  .table-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .table-preview {
    margin-top: 24px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);

      h3 {
        margin: 0;
        font-size: 16px;
      }
    }
  }
}
</style>
