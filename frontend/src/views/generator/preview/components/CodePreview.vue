<template>
  <div class="code-preview-container">
    <div class="preview-header">
      <div class="file-info">
        <span class="file-path" v-if="currentFile">{{ currentFile.path }}</span>
        <span class="file-lang" v-if="currentFile">{{ currentFile.language }}</span>
      </div>
      <div class="actions">
        <el-button type="primary" size="small" :disabled="!isModified" @click="handleSave">
          保存
        </el-button>
        <el-button size="small" :disabled="!isModified" @click="handleReset">
          重置
        </el-button>
      </div>
    </div>

    <div v-if="loading" class="preview-loading">
      <el-skeleton animated :rows="15" />
    </div>

    <div v-else-if="!currentFile" class="preview-empty">
      <el-empty description="请选择一个文件查看" />
    </div>

    <div v-else class="code-container">
      <div v-if="loading" class="loading-placeholder">
        <el-skeleton animated :rows="20" />
      </div>
      <template v-else-if="editorContent">
        <highlight-code :language="getLanguageFromFile(currentFile)" :code="editorContent" />
      </template>
      <el-empty v-else description="选择一个文件以查看内容" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as monaco from 'monaco-editor'
import type { PreviewFile } from '@/types/generator'
import HighlightCode from '@/components/HighlightCode/index.vue'

// 编辑器实例
let editor: monaco.editor.IStandaloneCodeEditor | null = null

// Props
const props = defineProps<{
  currentFile: PreviewFile | null
  editorContent: string
  isModified: boolean
  loading: boolean
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:editorContent', content: string): void
  (e: 'save'): void
  (e: 'reset'): void
}>()

// Refs
const editorContainer = ref<HTMLElement | null>(null)

// 处理保存操作
const handleSave = () => {
  emit('save')
}

// 处理重置操作
const handleReset = () => {
  emit('reset')
}

// 创建编辑器
const createEditor = () => {
  if (!editorContainer.value) return

  // 创建Monaco编辑器
  editor = monaco.editor.create(editorContainer.value, {
    value: props.editorContent,
    language: props.currentFile?.language || 'plaintext',
    theme: 'vs',
    automaticLayout: true,
    minimap: {
      enabled: true
    },
    scrollBeyondLastLine: false,
    fontSize: 14,
    tabSize: 2,
    wordWrap: 'on',
    lineNumbers: 'on',
    folding: true,
    glyphMargin: true,
    lineDecorationsWidth: 10
  })

  // 监听内容变化
  editor.onDidChangeModelContent(() => {
    if (editor) {
      const content = editor.getValue()
      emit('update:editorContent', content)
    }
  })
}

// 当所选文件变化时更新编辑器内容和语言
watch(
  () => [props.currentFile, props.editorContent],
  async ([newFile, newContent], [oldFile]) => {
    if (!editor) return

    if (newFile !== oldFile) {
      // 文件变化，设置新的语言
      monaco.editor.setModelLanguage(
        editor.getModel()!,
        typeof newFile === 'object' && newFile ? newFile.language : 'plaintext'
      )
    }

    // 更新编辑器内容，但保持光标位置
    const position = editor.getPosition()
    editor.setValue(typeof newContent === 'string' ? newContent : '')
    if (position) {
      editor.setPosition(position)
    }
  }
)

// 组件挂载时创建编辑器
onMounted(async () => {
  // 确保DOM已经渲染
  await nextTick()
  createEditor()
})

// 组件卸载前销毁编辑器
onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
    editor = null
  }
})

// 添加获取语言的方法
const getLanguageFromFile = (file: any) => {
  if (!file) return 'plaintext'

  const extension = file.path.split('.').pop()?.toLowerCase() || ''
  const languageMap: Record<string, string> = {
    'vue': 'html',
    'ts': 'typescript',
    'js': 'javascript',
    'java': 'java',
    'xml': 'xml',
    'json': 'json',
    'sql': 'sql',
    'md': 'markdown',
    'css': 'css',
    'scss': 'scss',
    'less': 'less',
    'html': 'html'
  }

  return languageMap[extension] || 'plaintext'
}
</script>

<style scoped>
.code-preview-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color);
}

.file-info {
  display: flex;
  align-items: center;
}

.file-path {
  font-family: monospace;
  font-size: 0.9rem;
  margin-right: 10px;
  color: var(--el-text-color-primary);
}

.file-lang {
  font-size: 0.7rem;
  background-color: var(--el-color-info-light-9);
  color: var(--el-color-info);
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.actions {
  display: flex;
  gap: 8px;
}

.preview-loading,
.preview-empty {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--el-bg-color-page);
  padding: 20px;
}

.preview-loading {
  padding: 20px;
  flex-direction: column;
  width: 100%;
}

.editor-container {
  flex: 1;
  overflow: hidden;
}

.monaco-editor {
  width: 100%;
  height: 100%;
}

.code-container {
  flex: 1;
  overflow: hidden;
}

.loading-placeholder {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--el-bg-color-page);
  padding: 20px;
}
</style>
