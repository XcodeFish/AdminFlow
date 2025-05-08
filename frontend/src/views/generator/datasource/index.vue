<template>
  <div class="datasource-container">
    <div class="datasource-header">
      <div class="left">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/generator' }">代码生成器</el-breadcrumb-item>
          <el-breadcrumb-item>数据源管理</el-breadcrumb-item>
        </el-breadcrumb>
        <h2 class="title">数据源管理</h2>
      </div>
      <div class="right">
        <el-button type="primary" @click="handleAdd" :icon="Plus">新增数据源</el-button>
        <el-button @click="handleRefresh" :icon="Refresh" :loading="loading">刷新</el-button>
      </div>
    </div>

    <el-card class="datasource-card">
      <template #header>
        <div class="card-header">
          <div class="card-title">数据源列表</div>
          <div class="card-tools">
            <el-input v-model="searchKeyword" placeholder="搜索数据源名称" clearable @clear="handleSearch"
              @keyup.enter="handleSearch" style="width: 220px">
              <template #suffix>
                <el-icon class="el-input__icon" @click="handleSearch">
                  <Search />
                </el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </template>

      <!-- 数据源表格 -->
      <DatasourceTable :datasources="datasources" :loading="loading" :total="total" :current-page="currentPage"
        :page-size="pageSize" :testing-id="testingId" @edit="handleEdit" @delete="handleDelete" @test="handleTest"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </el-card>

    <!-- 数据源表单对话框 -->
    <DatasourceForm v-model="formDialogVisible" :title="formTitle" :mode="formMode" :loading="formLoading"
      :datasource="currentDatasource" @submit="handleFormSubmit" @close="handleFormClose" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Refresh, Search } from '@element-plus/icons-vue'
import DatasourceTable from './components/DatasourceTable.vue'
import DatasourceForm from './components/DatasourceForm.vue'
import { useDatasource } from './hooks/useDatasource'
import { useConnection } from './hooks/useConnection'
import type { Datasource } from '@/types/generator'
import { ElMessageBox, ElMessage } from 'element-plus'

// 搜索关键词
const searchKeyword = ref('')
// 表单加载状态
const formLoading = ref(false)
// 当前测试中的数据源ID
const testingId = ref<number | null>(null)

// 使用数据源hook
const {
  datasources,
  loading,
  total,
  currentPage,
  pageSize,
  currentDatasource,
  formDialogVisible,
  formMode,
  formTitle,
  fetchDatasources,
  createDatasource,
  updateDatasource,
  deleteDatasource,
  openCreateDialog,
  openEditDialog,
  closeFormDialog
} = useDatasource()

// 使用连接测试hook
const { testConnection } = useConnection()

// 组件挂载时加载数据
onMounted(() => {
  fetchDatasources()
})

/**
 * 处理添加数据源
 */
const handleAdd = () => {
  openCreateDialog()
}

/**
 * 处理编辑数据源
 */
const handleEdit = (datasource: Datasource) => {
  openEditDialog(datasource)
}

/**
 * 处理删除数据源
 */
const handleDelete = async (id: number) => {
  await deleteDatasource(id)
}

/**
 * 处理测试连接
 */
const handleTest = async (datasource: Datasource) => {
  try {
    testingId.value = datasource.id
    // 弹出密码输入框
    const { value: password } = await ElMessageBox.prompt('请输入数据库密码', '测试连接', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'password',
      inputValidator: (value) => {
        if (!value) {
          return '密码不能为空'
        }
        return true
      }
    })

    // 使用用户输入的密码进行连接测试
    await testConnection({
      type: datasource.type,
      host: datasource.host,
      port: datasource.port,
      database: datasource.database,
      username: datasource.username,
      password: password, // 使用用户输入的密码
      options: datasource.options
    })
  } catch (error: any) {
    // 用户取消输入或其他错误
    if (error !== 'cancel') {
      ElMessage.error('测试连接失败: ' + (error.message || '未知错误'))
    }
  } finally {
    testingId.value = null
  }
}

/**
 * 处理表单提交
 */
const handleFormSubmit = async (formData: any) => {
  formLoading.value = true
  try {
    const { mode, id, data } = formData

    if (mode === 'create') {
      await createDatasource(data)
    } else {
      await updateDatasource(id, data)
    }

    closeFormDialog()
  } finally {
    formLoading.value = false
  }
}

/**
 * 处理表单关闭
 */
const handleFormClose = () => {
  closeFormDialog()
}

/**
 * 处理页面刷新
 */
const handleRefresh = () => {
  searchKeyword.value = ''
  fetchDatasources()
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  // 这里可以实现搜索逻辑，例如调用API进行筛选
  console.log('搜索关键词:', searchKeyword.value)
  fetchDatasources()
}

/**
 * 处理每页条数变化
 */
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchDatasources()
}

/**
 * 处理页码变化
 */
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchDatasources()
}
</script>

<style scoped>
.datasource-container {
  padding: 20px;
}

.datasource-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  margin: 15px 0;
  font-size: 20px;
  font-weight: 500;
}

.datasource-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
}

.card-tools {
  display: flex;
  align-items: center;
}
</style>
