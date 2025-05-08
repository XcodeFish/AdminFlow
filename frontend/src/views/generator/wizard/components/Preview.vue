<template>
  <div class="preview-component" :class="{ 'is-collapsed': isCollapsed }">
    <div class="preview-header">
      <div class="title">
        <span>代码预览</span>
        <el-tag size="small" type="info" v-if="currentFile">{{ fileTypeLabel }}</el-tag>
      </div>
      <div class="actions">
        <el-button type="primary" link :icon="isCollapsed ? 'Expand' : 'Fold'" @click="toggleCollapse">
          {{ isCollapsed ? '展开' : '收起' }}
        </el-button>
      </div>
    </div>

    <template v-if="!isCollapsed">
      <div v-if="!previewData" class="empty-placeholder">
        <el-empty description="暂无预览内容" />
        <div class="tips">完成配置后将在此处显示生成代码预览</div>
      </div>

      <template v-else>
        <div class="file-selector">
          <el-tabs v-model="activeFileType" type="card">
            <el-tab-pane label="前端代码" name="frontend">
              <div class="file-list">
                <div v-for="(file, index) in frontendFiles" :key="file.path" class="file-item"
                  :class="{ active: isCurrentFile(file) }" @click="selectFile(file)">
                  <el-icon>
                    <Document />
                  </el-icon>
                  <span class="file-name">{{ getFileName(file.path) }}</span>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="后端代码" name="backend">
              <div class="file-list">
                <div v-for="(file, index) in backendFiles" :key="file.path" class="file-item"
                  :class="{ active: isCurrentFile(file) }" @click="selectFile(file)">
                  <el-icon>
                    <Document />
                  </el-icon>
                  <span class="file-name">{{ getFileName(file.path) }}</span>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="SQL脚本" name="sql">
              <div class="file-list">
                <div v-for="(file, index) in sqlFiles" :key="file.path" class="file-item"
                  :class="{ active: isCurrentFile(file) }" @click="selectFile(file)">
                  <el-icon>
                    <Document />
                  </el-icon>
                  <span class="file-name">{{ getFileName(file.path) }}</span>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <div class="code-preview">
          <div v-if="currentFile" class="file-path">
            {{ currentFile.path }}
            <span class="file-size">{{ formatSize(currentFile.size) }}</span>
          </div>

          <div class="code-container">
            <pre v-if="currentFile"><code>{{ currentFile.content }}</code></pre>
            <el-empty v-else description="请选择一个文件查看内容" />
          </div>
        </div>

        <div class="preview-stats">
          <div class="stat-item">
            <div class="label">总文件数</div>
            <div class="value">{{ statistics.totalFiles }}</div>
          </div>
          <div class="stat-item">
            <div class="label">前端文件</div>
            <div class="value">{{ statistics.frontendFiles }}</div>
          </div>
          <div class="stat-item">
            <div class="label">后端文件</div>
            <div class="value">{{ statistics.backendFiles }}</div>
          </div>
          <div class="stat-item">
            <div class="label">SQL文件</div>
            <div class="value">{{ statistics.sqlFiles }}</div>
          </div>
          <div class="stat-item">
            <div class="label">代码行数</div>
            <div class="value">{{ statistics.totalCodeLines }}</div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { ElEmpty, ElButton, ElTabs, ElTabPane, ElTag, ElIcon } from 'element-plus'
import { Document, Expand, Fold } from '@element-plus/icons-vue'
import type { PreviewFile } from '@/types/generator'
import { usePreview } from '../hooks/usePreview'

const {
  previewResult,
  currentFile,
  frontendFiles,
  backendFiles,
  sqlFiles,
  statistics,
  selectFileByPath
} = usePreview()

// 组件状态
const isCollapsed = ref(false)
const activeFileType = ref('frontend')
const selectedFile = ref<PreviewFile | null>(null)

// 计算属性
const previewData = computed(() => previewResult.value)

const fileTypeLabel = computed(() => {
  if (!currentFile.value) return ''

  const ext = currentFile.value.path.split('.').pop()?.toLowerCase() || ''
  const typeMap: Record<string, string> = {
    'vue': 'Vue',
    'ts': 'TypeScript',
    'js': 'JavaScript',
    'java': 'Java',
    'xml': 'XML',
    'json': 'JSON',
    'sql': 'SQL',
    'md': 'Markdown',
    'css': 'CSS',
    'scss': 'SCSS',
    'less': 'LESS',
    'html': 'HTML'
  }

  return typeMap[ext] || ext.toUpperCase()
})

// 方法
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const selectFile = (file: PreviewFile) => {
  selectedFile.value = file
  selectFileByPath(file.path)
}

const isCurrentFile = (file: PreviewFile) => {
  return currentFile.value && currentFile.value.path === file.path
}

const getFileName = (path: string) => {
  return path.split('/').pop() || path
}

const formatSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  } else {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  }
}

// 监听文件类型变化，自动选择第一个文件
watch(activeFileType, (newType) => {
  if (newType === 'frontend' && frontendFiles.value.length > 0) {
    selectFile(frontendFiles.value[0])
  } else if (newType === 'backend' && backendFiles.value.length > 0) {
    selectFile(backendFiles.value[0])
  } else if (newType === 'sql' && sqlFiles.value.length > 0) {
    selectFile(sqlFiles.value[0])
  }
})

// 初始选择第一个前端文件
if (frontendFiles.value.length > 0) {
  selectFile(frontendFiles.value[0])
}
</script>

<style lang="scss" scoped>
.preview-component {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  background-color: var(--el-bg-color);

  &.is-collapsed {
    height: auto;
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: bold;
    }
  }

  .empty-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 0;

    .tips {
      margin-top: 16px;
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }
  }

  .file-selector {
    border-bottom: 1px solid var(--el-border-color-lighter);

    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }

    .file-list {
      max-height: 150px;
      overflow-y: auto;
      padding: 8px 0;

      .file-item {
        display: flex;
        align-items: center;
        padding: 6px 16px;
        cursor: pointer;

        &:hover {
          background-color: var(--el-fill-color-light);
        }

        &.active {
          background-color: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
        }

        .file-name {
          margin-left: 8px;
          font-size: 13px;
        }
      }
    }
  }

  .code-preview {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 200px;

    .file-path {
      padding: 8px 16px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      border-bottom: 1px solid var(--el-border-color-lighter);
      background-color: var(--el-fill-color-light);

      .file-size {
        margin-left: 8px;
        color: var(--el-text-color-placeholder);
      }
    }

    .code-container {
      flex: 1;
      overflow: auto;
      padding: 16px;
      background-color: var(--el-bg-color-page);

      pre {
        margin: 0;
        font-family: Consolas, Monaco, 'Andale Mono', monospace;
        font-size: 13px;
        line-height: 1.4;
        white-space: pre-wrap;
        word-break: break-all;
        word-wrap: break-word;
      }
    }
  }

  .preview-stats {
    display: flex;
    flex-wrap: wrap;
    padding: 8px 16px;
    background-color: var(--el-fill-color-light);
    border-top: 1px solid var(--el-border-color-lighter);

    .stat-item {
      margin-right: 24px;

      .label {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }

      .value {
        font-size: 14px;
        font-weight: bold;
        color: var(--el-text-color-primary);
      }
    }
  }
}
</style>
