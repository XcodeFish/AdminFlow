<template>
  <div class="highlight-code">
    <pre class="language-{{ language }}"><code v-html="highlightedCode"></code></pre>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import Prism from 'prismjs'

// 支持的代码语言
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-scss'
import 'prismjs/components/prism-less'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-kotlin'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-yaml'

// 代码高亮样式
import 'prismjs/themes/prism.css'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'

// 组件属性
const props = defineProps<{
  code: string
  language: string
}>()

// 代码高亮处理
const highlightedCode = computed(() => {
  if (!props.code) return ''

  try {
    // 获取对应语言的高亮规则
    const grammar = Prism.languages[props.language] || Prism.languages.plaintext
    // 进行代码高亮
    return Prism.highlight(props.code, grammar, props.language)
  } catch (error) {
    console.error('代码高亮错误:', error)
    return props.code
  }
})

// 组件挂载后重新高亮
onMounted(() => {
  Prism.highlightAll()
})
</script>

<style lang="scss" scoped>
.highlight-code {
  margin: 0;
  padding: 0;
  background-color: #f5f7fa;
  border-radius: 4px;

  pre {
    margin: 0;
    padding: 16px;
    overflow: auto;
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.5;
    tab-size: 4;
    white-space: pre-wrap;
    word-break: break-all;
    word-wrap: break-word;
  }

  code {
    font-family: inherit;
  }
}
</style>

