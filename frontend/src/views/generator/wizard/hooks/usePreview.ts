import { ref, computed } from 'vue'
import { useWizardStore } from '@/store/modules/wizard'
import type { GenerationResult, PreviewFile } from '@/types/generator'

/**
 * 预览功能Hook，用于管理代码生成结果的预览
 */
export function usePreview() {
  const wizardStore = useWizardStore()

  // 获取预览结果
  const previewResult = computed(() => wizardStore.previewResult)

  // 当前预览文件
  const currentFileIndex = ref(0)
  const currentFile = computed(() => {
    if (!previewResult.value || !previewResult.value.files.length) return null
    return previewResult.value.files[currentFileIndex.value] || previewResult.value.files[0]
  })

  // 文件类型过滤
  const fileTypes = computed(() => {
    if (!previewResult.value) return []

    const types = new Set<string>()
    previewResult.value.files.forEach((file) => {
      const ext = file.path.split('.').pop()
      if (ext) types.add(ext.toLowerCase())
    })

    return Array.from(types)
  })

  // 按类型分组的文件
  const filesByType = computed(() => {
    if (!previewResult.value) return {}

    const result: Record<string, PreviewFile[]> = {}

    previewResult.value.files.forEach((file) => {
      const pathParts = file.path.split('/')
      const type = pathParts[0] // frontend, backend, sql

      if (!result[type]) result[type] = []
      result[type].push(file)
    })

    return result
  })

  // 前端文件
  const frontendFiles = computed(() => filesByType.value['frontend'] || [])

  // 后端文件
  const backendFiles = computed(() => filesByType.value['backend'] || [])

  // SQL文件
  const sqlFiles = computed(() => filesByType.value['sql'] || [])

  /**
   * 获取代码预览统计
   */
  const statistics = computed(() => {
    if (!previewResult.value) {
      return {
        totalFiles: 0,
        totalCodeLines: 0,
        frontendFiles: 0,
        backendFiles: 0,
        sqlFiles: 0
      }
    }

    return {
      totalFiles: previewResult.value.files.length,
      totalCodeLines: previewResult.value.stats.totalCodeLines || 0,
      frontendFiles: frontendFiles.value.length,
      backendFiles: backendFiles.value.length,
      sqlFiles: sqlFiles.value.length
    }
  })

  /**
   * 选择预览文件
   * @param index 文件索引
   */
  const selectFile = (index: number) => {
    if (!previewResult.value) return

    if (index >= 0 && index < previewResult.value.files.length) {
      currentFileIndex.value = index
    }
  }

  /**
   * 根据路径选择预览文件
   * @param path 文件路径
   */
  const selectFileByPath = (path: string) => {
    if (!previewResult.value) return

    const index = previewResult.value.files.findIndex((f) => f.path === path)
    if (index !== -1) {
      currentFileIndex.value = index
    }
  }

  /**
   * 下载生成的代码
   */
  const downloadGeneratedCode = async () => {
    if (!previewResult.value) return

    try {
      // 构建下载链接
      const configId = previewResult.value.id
      if (!configId) throw new Error('缺少配置ID')

      // 调用API下载代码
      // 实际实现应该调用下载API
      // TODO: generatorApi.code.download(configId)

      // 模拟下载行为 (实际项目中应替换为真实API调用)
      alert('下载功能需要连接后端API')
    } catch (error) {
      console.error('下载代码失败:', error)
    }
  }

  /**
   * 获取完整代码生成结果
   */
  const getFullPreviewResult = async (): Promise<GenerationResult | null> => {
    if (!wizardStore.isCompleted) {
      try {
        return await wizardStore.completeWizard()
      } catch (error) {
        console.error('生成代码失败:', error)
        return null
      }
    }

    return previewResult.value
  }

  return {
    previewResult,
    currentFile,
    currentFileIndex,
    fileTypes,
    filesByType,
    frontendFiles,
    backendFiles,
    sqlFiles,
    statistics,

    selectFile,
    selectFileByPath,
    downloadGeneratedCode,
    getFullPreviewResult
  }
}

export default usePreview
