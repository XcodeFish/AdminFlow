import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '@/api/modules/generator'
import type {
  PreviewFile,
  FileTreeNode,
  GeneratedCodeFile,
  GeneratePreviewResponse
} from '@/types/generator'

/**
 * 代码预览Hook
 * 提供代码预览功能，包括加载预览数据、文件选择、文件编辑等
 */
export function useCodePreview() {
  const route = useRoute()

  // 基础状态
  const loading = ref(false)
  const configId = ref<number>(0)
  const previewData = ref<{
    frontend: GeneratedCodeFile[]
    backend: GeneratedCodeFile[]
    sql: GeneratedCodeFile[]
  } | null>(null)

  // 文件显示相关状态
  const currentFile = ref<PreviewFile | null>(null)
  const fileTree = ref<FileTreeNode[]>([])
  const fileList = ref<PreviewFile[]>([])
  const currentCategory = ref<'frontend' | 'backend' | 'sql'>('frontend')
  const editorContent = ref('')
  const isEdited = ref(false)
  const originalContent = ref('')

  // 初始化配置ID
  const initConfigId = () => {
    const id = route.params.id
    if (id && !Array.isArray(id)) {
      configId.value = parseInt(id, 10)
      return true
    }
    ElMessage.error('无效的配置ID')
    return false
  }

  /**
   * 加载预览数据
   */
  const loadPreviewData = async () => {
    if (!configId.value) {
      if (!initConfigId()) {
        return
      }
    }

    loading.value = true
    try {
      const response: GeneratePreviewResponse = await api.code.preview(configId.value)
      previewData.value = response.data

      // 生成文件列表和文件树
      processPreviewData()

      // 默认选择第一个文件
      if (fileList.value.length > 0) {
        selectFile(fileList.value[0])
      }
    } catch (error) {
      console.error('加载预览数据失败:', error)
      ElMessage.error('加载预览数据失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 处理预览数据，生成文件列表和文件树
   */
  const processPreviewData = () => {
    if (!previewData.value) return

    const allFiles: PreviewFile[] = []
    const treeRoot: Record<string, FileTreeNode[]> = {
      frontend: [],
      backend: [],
      sql: []
    }

    // 处理前端代码文件
    previewData.value.frontend.forEach((file) => {
      const previewFile = convertToPreviewFile(file, 'frontend')
      allFiles.push(previewFile)
      addToFileTree(treeRoot.frontend, previewFile)
    })

    // 处理后端代码文件
    previewData.value.backend.forEach((file) => {
      const previewFile = convertToPreviewFile(file, 'backend')
      allFiles.push(previewFile)
      addToFileTree(treeRoot.backend, previewFile)
    })

    // 处理SQL文件
    previewData.value.sql.forEach((file) => {
      const previewFile = convertToPreviewFile(file, 'sql')
      allFiles.push(previewFile)
      addToFileTree(treeRoot.sql, previewFile)
    })

    fileList.value = allFiles
    fileTree.value = [
      {
        name: '前端代码',
        path: 'frontend',
        type: 'directory',
        expanded: true,
        children: treeRoot.frontend
      },
      {
        name: '后端代码',
        path: 'backend',
        type: 'directory',
        expanded: true,
        children: treeRoot.backend
      },
      {
        name: 'SQL脚本',
        path: 'sql',
        type: 'directory',
        expanded: true,
        children: treeRoot.sql
      }
    ]
  }

  /**
   * 将文件添加到文件树
   */
  const addToFileTree = (tree: FileTreeNode[], file: PreviewFile) => {
    const pathParts = file.path.split('/')

    // 递归创建或获取目录节点
    const createOrGetNode = (
      nodes: FileTreeNode[],
      parts: string[],
      index: number
    ): FileTreeNode => {
      const part = parts[index]

      // 如果是最后一部分，则是文件
      if (index === parts.length - 1) {
        const fileNode: FileTreeNode = {
          name: part,
          path: file.path,
          type: 'file',
          size: file.size
        }
        nodes.push(fileNode)
        return fileNode
      }

      // 否则是目录，查找是否已存在
      let dirNode = nodes.find((node) => node.name === part && node.type === 'directory')

      if (!dirNode) {
        dirNode = {
          name: part,
          path: parts.slice(0, index + 1).join('/'),
          type: 'directory',
          expanded: true,
          children: []
        }
        nodes.push(dirNode)
      }

      // 递归处理下一级
      return createOrGetNode(dirNode.children || [], parts, index + 1)
    }

    createOrGetNode(tree, pathParts, 0)
  }

  /**
   * 将生成的代码文件转换为预览文件
   */
  const convertToPreviewFile = (
    file: GeneratedCodeFile,
    category: 'frontend' | 'backend' | 'sql'
  ): PreviewFile => {
    // 根据文件扩展名确定语言
    const extension = file.fileName.split('.').pop() || ''
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      vue: 'html',
      css: 'css',
      scss: 'scss',
      less: 'less',
      json: 'json',
      md: 'markdown',
      html: 'html',
      xml: 'xml',
      sql: 'sql',
      java: 'java',
      kt: 'kotlin',
      py: 'python',
      go: 'go'
    }

    return {
      path: file.fileName,
      content: file.content,
      originalContent: file.content,
      language: languageMap[extension] || 'plaintext',
      size: file.content.length,
      isChanged: false
    }
  }

  /**
   * 选择文件
   */
  const selectFile = (file: PreviewFile) => {
    // 检查是否需要保存当前文件的修改
    if (currentFile.value && isEdited.value) {
      // 在这里可以添加保存提示逻辑
      currentFile.value.content = editorContent.value
      currentFile.value.isChanged = true
    }

    currentFile.value = file
    editorContent.value = file.content
    originalContent.value = file.originalContent || file.content
    isEdited.value = file.isChanged

    // 根据文件路径确定当前分类
    if (file.path.startsWith('frontend/')) {
      currentCategory.value = 'frontend'
    } else if (file.path.startsWith('backend/')) {
      currentCategory.value = 'backend'
    } else {
      currentCategory.value = 'sql'
    }
  }

  /**
   * 切换目录展开/折叠状态
   */
  const toggleDirectory = (node: FileTreeNode) => {
    if (node.type === 'directory') {
      node.expanded = !node.expanded
    }
  }

  /**
   * 保存文件修改
   */
  const saveFile = () => {
    if (currentFile.value) {
      currentFile.value.content = editorContent.value
      currentFile.value.isChanged = editorContent.value !== originalContent.value
      isEdited.value = currentFile.value.isChanged
    }
  }

  /**
   * 保存所有修改到服务器
   */
  const saveAllChanges = async () => {
    const changedFiles = fileList.value.filter((file) => file.isChanged)

    if (changedFiles.length === 0) {
      ElMessage.info('没有需要保存的修改')
      return
    }

    loading.value = true
    try {
      await api.code.saveChanges({
        configId: configId.value,
        files: changedFiles.map((file) => ({
          path: file.path,
          content: file.content
        }))
      })

      // 更新所有已修改文件的原始内容
      changedFiles.forEach((file) => {
        file.originalContent = file.content
        file.isChanged = false
      })

      isEdited.value = false
      ElMessage.success('保存修改成功')
    } catch (error) {
      console.error('保存修改失败:', error)
      ElMessage.error('保存修改失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 切换编辑器内容
   */
  const updateEditorContent = (content: string) => {
    editorContent.value = content
    isEdited.value = content !== originalContent.value
  }

  // 统计数据
  const statistics = computed(() => ({
    totalFiles: fileList.value.length,
    frontendFiles: fileList.value.filter((file) => file.path.startsWith('frontend/')).length,
    backendFiles: fileList.value.filter((file) => file.path.startsWith('backend/')).length,
    sqlFiles: fileList.value.filter((file) => file.path.startsWith('sql/')).length,
    modifiedFiles: fileList.value.filter((file) => file.isChanged).length
  }))

  /**
   * 重置编辑器内容为原始内容
   */
  const resetEditorContent = () => {
    if (currentFile.value && originalContent.value) {
      editorContent.value = originalContent.value
      isEdited.value = false
    }
  }

  return {
    loading,
    configId,
    previewData,
    currentFile,
    fileTree,
    fileList,
    currentCategory,
    editorContent,
    isEdited,
    originalContent,
    statistics,
    initConfigId,
    loadPreviewData,
    selectFile,
    toggleDirectory,
    saveFile,
    saveAllChanges,
    updateEditorContent,
    resetEditorContent
  }
}
