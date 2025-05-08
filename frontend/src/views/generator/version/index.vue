<template>
  <div class="version-container">
    <div class="version-header">
      <div class="header-left">
        <h2>版本管理</h2>
        <el-tag type="info" effect="plain" class="config-tag">
          配置ID: {{ configId }} | {{ configInfo?.moduleName || '加载中...' }}
        </el-tag>
      </div>
      <div class="header-right">
        <el-button @click="goBack">
          <el-icon><arrow-left /></el-icon>
          返回
        </el-button>
      </div>
    </div>

    <div class="version-content">
      <VersionTable :versionList="versionList" :total="total" :currentPage="currentPage" :pageSize="pageSize"
        :loading="loading" @view="openDetailDialog" @rollback="openRollbackDialog" @delete="deleteVersion"
        @create="createVersion" @page-change="handlePageChange" @size-change="handleSizeChange" />
    </div>

    <!-- 版本详情对话框 -->
    <VersionDetail v-model="detailDialogVisible" :version="currentVersion" :loading="loading"
      @rollback="openRollbackDialog" />

    <!-- 回滚确认对话框 -->
    <RollbackConfirm v-model="rollbackDialogVisible" :version="currentVersion" :rollbackProgress="rollbackProgress"
      :rollbackStatus="rollbackStatus" @rollback="rollbackToVersion" @reset="resetRollbackStatus" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import generatorApi from '@/api/modules/generator'
import VersionTable from './components/VersionTable.vue'
import VersionDetail from './components/VersionDetail.vue'
import RollbackConfirm from './components/RollbackConfirm.vue'
import { useVersionList } from './hooks/useVersionList'
import { useRollback } from './hooks/useRollback'
import type { GeneratorConfig } from '@/types/generator'

const route = useRoute()
const router = useRouter()

// 从路由参数中获取配置ID
const configId = Number(route.params.configId || 0)
const configInfo = ref<GeneratorConfig | null>(null)

// 加载配置信息
const loadConfigInfo = async () => {
  if (!configId) {
    ElMessage.error('无效的配置ID')
    return
  }

  try {
    const res = await generatorApi.config.getById(configId)
    configInfo.value = res.data
  } catch (error) {
    ElMessage.error('获取配置信息失败')
    console.error('获取配置信息失败:', error)
  }
}

// 使用版本列表逻辑Hook
const {
  versionList,
  total,
  currentPage,
  pageSize,
  loading,
  currentVersion,
  detailDialogVisible,
  rollbackDialogVisible,
  fetchVersionList,
  openDetailDialog,
  closeDetailDialog,
  openRollbackDialog,
  closeRollbackDialog,
  deleteVersion,
  createVersion,
  handlePageChange,
  handleSizeChange
} = useVersionList(configId)

// 使用回滚逻辑Hook
const {
  rollbackProgress,
  rollbackStatus,
  rollbackToVersion,
  resetRollbackStatus
} = useRollback(() => {
  // 回滚成功后的回调
  ElNotification({
    title: '回滚成功',
    message: '配置已成功回滚到选中版本',
    type: 'success'
  })
  // 刷新列表
  fetchVersionList()
})

// 返回配置列表页面
const goBack = () => {
  router.push('/generator/config')
}

// 初始化
onMounted(() => {
  loadConfigInfo()
})

// 监听configId变化，重新加载数据
watch(() => route.params.configId, (newId) => {
  if (newId && Number(newId) !== configId) {
    window.location.reload()
  }
})
</script>

<style scoped>
.version-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.version-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.config-tag {
  margin-left: 15px;
}

.version-content {
  flex: 1;
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

h2 {
  margin: 0;
  color: #303133;
}
</style>
