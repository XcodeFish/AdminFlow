<template>
  <el-select v-model="selectedValue" :placeholder="placeholder" clearable :disabled="disabled" @change="handleChange">
    <el-option v-for="item in normalizedOptions" :key="item.value" :label="item.label" :value="item.value" />
  </el-select>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

interface TreeNode {
  id: string
  [key: string]: any
}

interface TreeOption {
  value: string
  label: string
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  modelValue: string
  data: TreeNode[]
  labelKey?: string
  valueKey?: string
  placeholder?: string
  disabled?: boolean
}>(), {
  modelValue: '',
  labelKey: 'menuName',
  valueKey: 'id',
  placeholder: '请选择',
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const selectedValue = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val)
})

// 将树形结构扁平化为选项数组
const normalizedOptions = computed(() => {
  const result: TreeOption[] = []

  // 根节点
  result.push({
    value: '0',
    label: '顶级菜单'
  })

  // 递归处理节点
  const processNode = (nodes: TreeNode[], depth = 0, parentPath = '') => {
    if (!nodes || !Array.isArray(nodes)) return
    nodes.forEach(node => {
      if (!node) return
      const prefix = '—'.repeat(depth)
      result.push({
        value: node[props.valueKey] || '',
        label: (depth > 0 ? prefix + ' ' : '') + (node[props.labelKey] || '')
      })

      if (node.children && Array.isArray(node.children) && node.children.length > 0) {
        processNode(node.children, depth + 1, parentPath + (node[props.labelKey] || '') + ' / ')
      }
    })
  }

  processNode(props.data)
  return result
})

const handleChange = (value: string) => {
  emit('change', value)
}

// 监听数据变化
watch(() => props.data, () => {
  // 如果当前选中值不在选项中，重置选择
  if (selectedValue.value && !normalizedOptions.value.some(item => item.value === selectedValue.value)) {
    selectedValue.value = ''
  }
}, { deep: true })
</script>
