<template>
  <div class="preview-container">
    <div class="preview-header">
      <div class="left">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/generator' }">代码生成器</el-breadcrumb-item>
          <el-breadcrumb-item>代码预览</el-breadcrumb-item>
        </el-breadcrumb>
        <h2 class="title">代码预览与部署</h2>
      </div>
      <div class="right">
        <el-button @click="handleBack" icon="ArrowLeft">返回</el-button>
        <el-button type="primary" @click="handleSaveAllChanges" :loading="loading" :disabled="!hasModifiedFiles">
          保存所有修改
        </el-button>
        <el-button @click="handleRefresh" icon="Refresh" :loading="loading">刷新</el-button>
      </div>
    </div>

    <div class="preview-content">
      <div v-if="loading && !previewData" class="loading-container">
        <el-skeleton animated>
          <template #template>
            <div style="padding: 20px; width: 100%;">
              <el-skeleton-item variant="h1" style="width: 50%;" />
              <div style="display: flex; align-items: flex-start; margin-top: 20px;">
                <div style="width: 240px;">
                  <el-skeleton-item variant="text" style="margin-right: 16px;" />
                  <el-skeleton-item variant="text" style="width: 80%;" />
                  <el-skeleton-item variant="text" style="width: 60%;" />
                  <el-skeleton-item variant="text" style="width: 70%;" />
                </div>
                <div style="flex: 1;">
                  <el-skeleton-item variant="text" style="margin-right: 16px;" />
                  <el-skeleton-item variant="text" />
                  <el-skeleton-item variant="text" />
                  <el-skeleton-item variant="text" />
                  <el-skeleton-item variant="text" />
                  <el-skeleton-item variant="text" />
                  <el-skeleton-item variant="text" />
                </div>
                <div style="width: 300px;">
                  <el-skeleton-item variant="text" style="width: 80%;" />
                  <el-skeleton-item variant="text" style="width: 90%;" />
                  <el-skeleton-item variant="text" style="width: 70%;" />
                  <el-skeleton-item variant="text" style="width: 80%;" />
                </div>
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>

      <div v-else class="preview-layout">
        <!-- 左侧文件树 -->
        <div class="file-tree-panel">
          <FileTree :tree-data="fileTree" :file-list="fileList" :current-file="currentFile" :statistics="statistics"
            @select-file="selectFile" @toggle-directory="toggleDirectory" />
        </div>

        <!-- 中间代码预览 -->
        <div class="code-preview-panel">
          <CodePreview :current-file="currentFile" :editor-content="editorContent" :is-modified="isEdited"
            :loading="loading" @update:editor-content="updateEditorContent" @save="saveFile"
            @reset="resetEditorContent" />
        </div>

        <!-- 右侧部署选项 -->
        <div class="deploy-options-panel">
          <DeployOptions :config-id="configId" :loading="loading" :deploying="deploying" :deployment-id="deploymentId"
            :deploy-status="deployStatus" :deploy-progress="deployProgress" :deploy-logs="deployLogs"
            :deploy-destination="deployDestination" :options="deployOptions" @generate="handleGenerate"
            @deploy="handleDeploy" @download="handleDownload" @cancel="handleCancelDeploy" @retry="handleRetryDeploy"
            @update:options="updateDeployOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCodePreview } from './hooks/useCodePreview'
import { useDeploy } from './hooks/useDeploy'
import FileTree from './components/FileTree.vue'
import CodePreview from './components/CodePreview.vue'
import DeployOptions from './components/DeployOptions.vue'

// 路由
const router = useRouter()

// 使用代码预览hook
const {
  loading: previewLoading,
  configId,
  previewData,
  currentFile,
  fileTree,
  fileList,
  editorContent,
  isEdited,
  statistics,
  loadPreviewData,
  selectFile,
  toggleDirectory,
  saveFile,
  saveAllChanges,
  updateEditorContent,
  resetEditorContent
} = useCodePreview()

// 使用部署hook
const {
  loading: deployLoading,
  deploying,
  deploymentId,
  deployStatus,
  deployProgress,
  deployLogs,
  deployDestination,
  deployOptions,
  generateCode,
  downloadCode,
  deployCode,
  cancelDeploy,
  retryDeploy,
  updateDeployOptions
} = useDeploy()

// 合并loading状态
const loading = computed(() => previewLoading.value || deployLoading.value)

// 是否有修改过的文件
const hasModifiedFiles = computed(() => statistics.value.modifiedFiles > 0)

// 组件挂载时加载数据
onMounted(() => {
  loadPreviewData()
})

// 处理返回按钮
const handleBack = () => {
  router.push('/generator')
}

// 处理刷新
const handleRefresh = () => {
  loadPreviewData()
}

// 处理保存所有修改
const handleSaveAllChanges = async () => {
  await saveAllChanges()
}

// 处理生成代码
const handleGenerate = async () => {
  if (configId.value) {
    await generateCode(configId.value)
    // 生成后重新加载预览数据
    await loadPreviewData()
  }
}

// 处理部署代码
const handleDeploy = async () => {
  if (configId.value) {
    await deployCode(configId.value)
  }
}

// 处理下载代码
const handleDownload = async () => {
  if (configId.value) {
    await downloadCode(configId.value)
  }
}

// 处理取消部署
const handleCancelDeploy = async () => {
  await cancelDeploy()
}

// 处理重试部署
const handleRetryDeploy = async () => {
  await retryDeploy()
}
</script>

<style scoped>
.preview-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-header {
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color-light);
}

.preview-header .left {
  display: flex;
  flex-direction: column;
}

.preview-header .title {
  margin: 8px 0 0 0;
  font-size: 20px;
}

.preview-header .right {
  display: flex;
  gap: 10px;
}

.preview-content {
  flex: 1;
  overflow: hidden;
}

.loading-container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.preview-layout {
  display: flex;
  height: 100%;
}

.file-tree-panel {
  width: 280px;
  height: 100%;
  overflow: hidden;
  border-right: 1px solid var(--el-border-color-light);
}

.code-preview-panel {
  flex: 1;
  height: 100%;
  overflow: hidden;
}

.deploy-options-panel {
  width: 320px;
  height: 100%;
  overflow: hidden;
  border-left: 1px solid var(--el-border-color-light);
}
</style>
