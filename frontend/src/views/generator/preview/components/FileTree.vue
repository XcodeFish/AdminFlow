<template>
  <div class="file-tree-container">
    <div class="file-tree-header">
      <div class="title">文件列表</div>
      <div class="search-box">
        <el-input v-model="searchQuery" placeholder="搜索文件" clearable size="small" @input="handleSearch">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>
    </div>
    <div class="file-tree-content">
      <el-tree :data="filteredTreeData" :props="defaultProps" :expand-on-click-node="false" node-key="path"
        :default-expanded-keys="defaultExpandedKeys" :highlight-current="true" :filter-node-method="filterNode"
        ref="treeRef">
        <template #default="{ node, data }">
          <div class="custom-node" @click="handleNodeClick(data)">
            <el-icon v-if="data.type === 'directory'" class="folder-icon">
              <Folder v-if="!node.expanded" />
              <FolderOpened v-else />
            </el-icon>
            <el-icon v-else class="file-icon">
              <Document />
            </el-icon>
            <span class="node-label" :class="{ 'is-modified': isModified(data) }">{{ node.label }}</span>
            <span v-if="data.type === 'file' && data.size" class="file-size">{{ formatFileSize(data.size) }}</span>
          </div>
        </template>
      </el-tree>
    </div>
    <div class="file-tree-stats">
      <div class="stat-item">
        <span class="stat-label">总文件数</span>
        <span class="stat-value">{{ stats.totalFiles }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">已修改</span>
        <span class="stat-value">{{ stats.modifiedFiles }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Document, Folder, FolderOpened, Search } from '@element-plus/icons-vue'
import type { FileTreeNode, PreviewFile } from '@/types/generator'
import type { ElTree } from 'element-plus'

// Props
const props = defineProps<{
  treeData: FileTreeNode[]
  fileList: PreviewFile[]
  currentFile: PreviewFile | null
  statistics: {
    totalFiles: number
    frontendFiles: number
    backendFiles: number
    sqlFiles: number
    modifiedFiles: number
  }
}>()

// Emits
const emit = defineEmits<{
  (e: 'select-file', file: PreviewFile): void
  (e: 'toggle-directory', node: FileTreeNode): void
}>()

// Refs
const treeRef = ref<InstanceType<typeof ElTree>>()
const searchQuery = ref('')

// 配置
const defaultProps = {
  children: 'children',
  label: 'name'
}

// 默认展开所有根目录
const defaultExpandedKeys = computed(() => {
  return props.treeData.map(node => node.path)
})

// 搜索过滤后的树数据
const filteredTreeData = computed(() => {
  if (!searchQuery.value) {
    return props.treeData
  }

  // 深拷贝树数据以避免修改原始数据
  const cloneData = JSON.parse(JSON.stringify(props.treeData))

  // 过滤树
  return filterTree(cloneData, searchQuery.value.toLowerCase())
})

// 递归过滤树数据
const filterTree = (nodes: FileTreeNode[], query: string): FileTreeNode[] => {
  return nodes.filter(node => {
    // 如果是文件且匹配搜索条件，则保留
    if (node.type === 'file' && node.name.toLowerCase().includes(query)) {
      return true
    }

    // 如果是目录，递归过滤子节点
    if (node.type === 'directory' && node.children) {
      node.children = filterTree(node.children, query)
      // 如果子节点有匹配的，或目录名称匹配，则保留
      return node.children.length > 0 || node.name.toLowerCase().includes(query)
    }

    return false
  })
}

// 过滤节点方法，用于树组件的过滤
const filterNode = (value: string, data: any) => {
  if (!value) return true
  return (data as FileTreeNode).name.toLowerCase().includes(value.toLowerCase())
}

// 处理搜索输入
const handleSearch = () => {
  treeRef.value?.filter(searchQuery.value)
}

// 处理节点点击
const handleNodeClick = (data: FileTreeNode) => {
  if (data.type === 'directory') {
    // 切换目录展开/折叠状态
    emit('toggle-directory', data)
  } else {
    // 查找并选中文件
    const file = props.fileList.find(f => f.path === data.path)
    if (file) {
      emit('select-file', file)
    }
  }
}

// 检查文件是否被修改
const isModified = (node: FileTreeNode): boolean => {
  if (node.type === 'file') {
    const file = props.fileList.find(f => f.path === node.path)
    return !!file?.isChanged
  }
  return false
}

// 格式化文件大小
const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return `${size}B`
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)}KB`
  } else {
    return `${(size / (1024 * 1024)).toFixed(1)}MB`
  }
}

// 统计数据
const stats = computed(() => props.statistics)

// 监听当前文件变化，在树中高亮显示
watch(
  () => props.currentFile,
  (newVal) => {
    if (newVal) {
      treeRef.value?.setCurrentKey(newVal.path)
    }
  }
)
</script>

<style scoped>
.file-tree-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid var(--el-border-color-light);
}

.file-tree-header {
  padding: 10px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.file-tree-header .title {
  font-weight: bold;
  margin-bottom: 10px;
}

.file-tree-content {
  flex: 1;
  overflow: auto;
  padding: 10px;
}

.custom-node {
  display: flex;
  align-items: center;
  height: 28px;
  cursor: pointer;
  font-size: 14px;
}

.folder-icon,
.file-icon {
  margin-right: 5px;
}

.folder-icon {
  color: var(--el-color-warning);
}

.file-icon {
  color: var(--el-color-info);
}

.node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-label.is-modified {
  font-weight: bold;
  color: var(--el-color-primary);
}

.file-size {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin-left: 5px;
}

.file-tree-stats {
  padding: 10px;
  background-color: var(--el-bg-color-page);
  border-top: 1px solid var(--el-border-color-light);
  display: flex;
  justify-content: space-between;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.stat-value {
  font-weight: bold;
  color: var(--el-text-color-primary);
}
</style>
