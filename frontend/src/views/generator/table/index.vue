<template>
  <div class="table-container">
    <div class="table-header">
      <div class="left">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/generator' }">代码生成器</el-breadcrumb-item>
          <el-breadcrumb-item>表结构管理</el-breadcrumb-item>
        </el-breadcrumb>
        <h2 class="title">表结构管理</h2>
      </div>
      <div class="right">
        <el-button @click="handleRefresh" :icon="Refresh" :loading="loading">刷新</el-button>
      </div>
    </div>

    <el-card class="datasource-select-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">选择数据源</span>
        </div>
      </template>

      <el-form :inline="true">
        <el-form-item label="数据源">
          <el-select v-model="selectedDatasourceId" placeholder="请选择数据源" style="width: 250px"
            @change="handleDatasourceChange" :loading="datasourcesLoading" clearable>
            <el-option v-for="item in datasources" :key="item.id" :label="item.name" :value="item.id"
              :disabled="!item.isActive">
              <div class="datasource-option">
                <span>{{ item.name }}</span>
                <el-tag size="small" :type="item.isActive ? 'success' : 'danger'">
                  {{ item.isActive ? '正常' : '异常' }}
                </el-tag>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="搜索">
          <el-input v-model="searchKeyword" placeholder="输入表名搜索" clearable style="width: 250px" @clear="handleSearch"
            @keyup.enter="handleSearch">
            <template #suffix>
              <el-icon class="el-input__icon" @click="handleSearch">
                <Search />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-list-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">表列表</span>
          <span class="table-count" v-if="!loading && !isEmpty">共 {{ total }} 个表</span>
        </div>
      </template>

      <!-- 表列表组件 -->
      <TableList :tables="tables" :loading="loading" :total="total" :current-page="currentPage" :page-size="pageSize"
        :current-datasource-id="currentDatasourceId || undefined" @select="handleSelectTable"
        @view-detail="handleViewDetail" @import="handleImportTable" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </el-card>

    <!-- 表详情抽屉 -->
    <TableDetail v-model="detailDrawerVisible" :table-detail="tableDetail" :loading="detailLoading"
      @close="handleDetailClose" @import="handleImportTableDetail" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Refresh, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import TableList from './components/TableList.vue'
import TableDetail from './components/TableDetail.vue'
import { useTableList } from './hooks/useTableList'
import { useTableDetail } from './hooks/useTableDetail'
import api from '@/api/modules/generator'
import type { Datasource, TableInfo } from '@/types/generator'

// 搜索关键词
const searchKeyword = ref('')

// 数据源相关
const datasources = ref<Datasource[]>([])
const datasourcesLoading = ref(false)
const selectedDatasourceId = ref<number>(0)

// 使用表列表hook
const {
  tables,
  loading,
  total,
  currentPage,
  pageSize,
  currentDatasourceId,
  currentTable,
  isEmpty,
  fetchTables,
  refreshTable,
  selectTable,
  clearSelection
} = useTableList()

// 使用表详情hook
const {
  tableDetail,
  loading: detailLoading,
  detailDrawerVisible,
  fetchTableDetail,
  openDetailDrawer,
  closeDetailDrawer,
  importTableToConfig
} = useTableDetail()

// 组件挂载时加载数据源
onMounted(async () => {
  await loadDatasources()
})

/**
 * 加载数据源列表
 */
const loadDatasources = async () => {
  datasourcesLoading.value = true

  try {
    const response = await api.datasource.getList()
    datasources.value = response.data.items || []

    // 如果有活跃的数据源，自动选择第一个
    const activeDs = datasources.value.find(ds => ds.isActive)
    if (activeDs) {
      selectedDatasourceId.value = activeDs.id
      await handleDatasourceChange(activeDs.id)
    } else {
      // 设置为0或未选择状态
      selectedDatasourceId.value = 0
      // 清空表数据
      tables.value = []
      total.value = 0
      currentDatasourceId.value = null
    }
  } catch (error) {
    console.error('获取数据源列表失败:', error)
    ElMessage.error('获取数据源列表失败')
    // 出错时也重置为0
    selectedDatasourceId.value = 0
  } finally {
    datasourcesLoading.value = false
  }
}

/**
 * 处理数据源变更
 */
const handleDatasourceChange = async (datasourceId: number) => {
  if (!datasourceId) {
    // 如果ID为0或未选择，则清空表数据
    clearSelection()
    tables.value = []
    total.value = 0
    currentDatasourceId.value = null
    return
  }

  // 清空搜索关键词和表选择
  searchKeyword.value = ''
  clearSelection()

  // 加载表列表
  await fetchTables(datasourceId)
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  // 在这里实现搜索逻辑，暂时简单刷新
  if (currentDatasourceId.value) {
    fetchTables(currentDatasourceId.value)
  }
}

/**
 * 处理刷新
 */
const handleRefresh = async () => {
  if (currentDatasourceId.value) {
    await fetchTables(currentDatasourceId.value)
  } else {
    await loadDatasources()
  }
}

/**
 * 处理选择表
 */
const handleSelectTable = (table: TableInfo) => {
  selectTable(table)
}

/**
 * 处理查看表详情
 */
const handleViewDetail = async (table: TableInfo) => {
  if (currentDatasourceId.value) {
    await openDetailDrawer(currentDatasourceId.value, table.tableName)
  }
}

/**
 * 处理导入表到配置
 */
const handleImportTable = async (table: TableInfo) => {
  if (currentDatasourceId.value) {
    await importTableToConfig(currentDatasourceId.value, table.tableName)
  }
}

/**
 * 处理关闭详情抽屉
 */
const handleDetailClose = () => {
  closeDetailDrawer()
}

/**
 * 处理导入表详情到配置
 */
const handleImportTableDetail = async (tableDetail: any) => {
  if (currentDatasourceId.value) {
    await importTableToConfig(currentDatasourceId.value, tableDetail.tableName)
    closeDetailDrawer()
  }
}

/**
 * 处理每页条数变化
 */
const handleSizeChange = (size: number) => {
  pageSize.value = size
  if (currentDatasourceId.value) {
    fetchTables(currentDatasourceId.value)
  }
}

/**
 * 处理页码变化
 */
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  if (currentDatasourceId.value) {
    fetchTables(currentDatasourceId.value)
  }
}
</script>

<style scoped>
.table-container {
  padding: 20px;
}

.table-header {
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

.datasource-select-card,
.table-list-card {
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

.table-count {
  font-size: 14px;
  color: #909399;
}

.datasource-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
</style>
