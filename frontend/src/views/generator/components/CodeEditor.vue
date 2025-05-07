<template>
  <div class="code-editor">
    <div class="code-editor__header" v-if="showHeader">
      <div class="editor-title">
        <span v-if="filename">{{ filename }}</span>
        <span v-else>代码编辑器</span>
      </div>
      <div class="editor-actions">
        <el-select v-if="showLanguageSelector" v-model="currentLanguage" size="small" style="width: 120px;">
          <el-option v-for="lang in supportedLanguages" :key="lang.value" :label="lang.label"
            :value="lang.value"></el-option>
        </el-select>
        <el-button-group>
          <el-tooltip content="格式化代码">
            <el-button size="small" icon="Edit" @click="formatCode"></el-button>
          </el-tooltip>
          <el-tooltip content="复制代码">
            <el-button size="small" icon="CopyDocument" @click="copyCode"></el-button>
          </el-tooltip>
          <el-tooltip content="下载文件">
            <el-button size="small" icon="Download" @click="downloadCode"></el-button>
          </el-tooltip>
        </el-button-group>
      </div>
    </div>

    <div class="code-editor__container" ref="editorContainer"></div>

    <div class="code-editor__footer" v-if="showFooter">
      <div class="editor-info">
        <span>{{ currentLanguage }}</span>
        <span>|</span>
        <span>行: {{ cursorPosition.line }}, 列: {{ cursorPosition.column }}</span>
      </div>
      <div class="editor-settings">
        <el-tooltip content="编辑器设置">
          <el-button size="small" icon="Setting" circle @click="showSettings = true"></el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 设置抽屉 -->
    <el-drawer v-model="showSettings" title="编辑器设置" direction="rtl" size="300px">
      <el-form label-position="top">
        <el-form-item label="主题">
          <el-select v-model="editorOptions.theme" style="width: 100%">
            <el-option label="浅色" value="light"></el-option>
            <el-option label="深色" value="vs-dark"></el-option>
            <el-option label="高对比度" value="hc-black"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="字体大小">
          <el-input-number v-model="editorOptions.fontSize" :min="12" :max="24" :step="1"></el-input-number>
        </el-form-item>

        <el-form-item label="Tab大小">
          <el-input-number v-model="editorOptions.tabSize" :min="2" :max="8" :step="1"></el-input-number>
        </el-form-item>

        <el-form-item label="显示行号">
          <el-switch v-model="editorOptions.lineNumbers"></el-switch>
        </el-form-item>

        <el-form-item label="自动换行">
          <el-switch v-model="editorOptions.wordWrap"></el-switch>
        </el-form-item>

        <el-form-item label="显示缩进参考线">
          <el-switch v-model="editorOptions.indentGuides"></el-switch>
        </el-form-item>

        <el-form-item label="自动完成">
          <el-switch v-model="editorOptions.quickSuggestions"></el-switch>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as monaco from 'monaco-editor'
import { Edit, CopyDocument, Download, Setting } from '@element-plus/icons-vue'

// 定义Monaco编辑器的位置更改事件类型
interface CursorPositionChangeEvent {
  position: {
    lineNumber: number
    column: number
  }
}

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'javascript'
  },
  readonly: {
    type: Boolean,
    default: false
  },
  minimap: {
    type: Boolean,
    default: true
  },
  lineNumbers: {
    type: Boolean,
    default: true
  },
  theme: {
    type: String,
    default: 'vs'
  },
  filename: {
    type: String,
    default: ''
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  showLanguageSelector: {
    type: Boolean,
    default: true
  },
  height: {
    type: String,
    default: '100%'
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'save', 'format'])

// 编辑器实例
let editor: monaco.editor.IStandaloneCodeEditor | null = null

// 编辑器容器DOM引用
const editorContainer = ref<HTMLElement>()

// 编辑器相关状态
const currentValue = ref(props.modelValue)
const currentLanguage = ref(props.language)
const showSettings = ref(false)
const cursorPosition = reactive({
  line: 1,
  column: 1
})

// 编辑器配置选项
const editorOptions = reactive({
  theme: props.theme,
  fontSize: 14,
  tabSize: 2,
  lineNumbers: props.lineNumbers,
  wordWrap: true,
  indentGuides: true,
  quickSuggestions: true
})

// 支持的语言列表
const supportedLanguages = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'JSON', value: 'json' },
  { label: 'SQL', value: 'sql' },
  { label: 'XML', value: 'xml' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'Java', value: 'java' },
  { label: 'Python', value: 'python' }
]

// 初始化编辑器
const initEditor = () => {
  if (!editorContainer.value) return

  editor = monaco.editor.create(editorContainer.value, {
    value: currentValue.value,
    language: currentLanguage.value,
    theme: editorOptions.theme,
    readOnly: props.readonly,
    minimap: {
      enabled: props.minimap
    },
    lineNumbers: editorOptions.lineNumbers ? 'on' : 'off',
    fontSize: editorOptions.fontSize,
    tabSize: editorOptions.tabSize,
    wordWrap: editorOptions.wordWrap ? 'on' : 'off',
    guides: {
      indentation: editorOptions.indentGuides
    },
    quickSuggestions: editorOptions.quickSuggestions,
    scrollBeyondLastLine: false,
    automaticLayout: true
  })

  // 监听内容变化
  editor.onDidChangeModelContent(() => {
    if (editor) {
      const value = editor.getValue()
      currentValue.value = value
      emit('update:modelValue', value)
      emit('change', value)
    }
  })

  // 监听光标位置变化
  editor.onDidChangeCursorPosition((e: CursorPositionChangeEvent) => {
    cursorPosition.line = e.position.lineNumber
    cursorPosition.column = e.position.column
  })

  // 添加键盘快捷键
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
    emit('save', currentValue.value)
  })

  editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
    formatCode()
  })
}

// 格式化代码
const formatCode = async () => {
  if (!editor) return

  await editor.getAction('editor.action.formatDocument')?.run()
  emit('format', currentValue.value)
  ElMessage.success('代码格式化成功')
}

// 复制代码
const copyCode = () => {
  if (!editor) return

  const code = editor.getValue()
  navigator.clipboard.writeText(code).then(() => {
    ElMessage.success('代码已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

// 下载代码
const downloadCode = () => {
  if (!editor) return

  const code = editor.getValue()
  const filename = props.filename || 'code.' + currentLanguage.value

  const blob = new Blob([code], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  ElMessage.success(`已下载文件: ${filename}`)
}

// 更新编辑器配置
const updateEditorOptions = () => {
  if (!editor) return

  editor.updateOptions({
    theme: editorOptions.theme,
    fontSize: editorOptions.fontSize,
    lineNumbers: editorOptions.lineNumbers ? 'on' : 'off',
    tabSize: editorOptions.tabSize,
    wordWrap: editorOptions.wordWrap ? 'on' : 'off',
    guides: {
      indentation: editorOptions.indentGuides
    },
    quickSuggestions: editorOptions.quickSuggestions
  })
}

// 监听选项变化
watch(() => editorOptions, () => {
  updateEditorOptions()
}, { deep: true })

// 监听modelValue变化
watch(() => props.modelValue, (newValue) => {
  if (newValue !== currentValue.value && editor) {
    const position = editor.getPosition()
    editor.setValue(newValue)
    if (position) {
      editor.setPosition(position)
    }
  }
})

// 监听language变化
watch(() => props.language, (newLanguage) => {
  currentLanguage.value = newLanguage

  if (editor) {
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, newLanguage)
    }
  }
})

// 监听自定义language变化
watch(() => currentLanguage.value, (newLanguage) => {
  if (editor) {
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, newLanguage)
    }
  }
})

// 组件挂载后初始化编辑器
onMounted(async () => {
  await nextTick()
  initEditor()
})

// 组件卸载前销毁编辑器
onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
  }
})

// 对外暴露方法
defineExpose({
  formatCode,
  copyCode,
  downloadCode,
  editor: () => editor
})
</script>

<style scoped>
.code-editor {
  height: v-bind('props.height');
  display: flex;
  flex-direction: column;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.code-editor__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.editor-title {
  font-weight: bold;
  font-size: 14px;
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.code-editor__container {
  flex: 1;
  overflow: hidden;
}

.code-editor__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 12px;
  background-color: #f5f7fa;
  border-top: 1px solid #e4e7ed;
  font-size: 12px;
  color: #606266;
}

.editor-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
