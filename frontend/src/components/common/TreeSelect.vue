<template>
  <el-select v-model="selectedValue" :placeholder="placeholder" clearable :disabled="disabled" @change="handleChange">
    <el-option v-for="item in normalizedOptions" :key="item.value ?? '_null_'" :label="item.label" :value="item.value === null ? '' : item.value" />
  </el-select>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

// 定义常量代表 null 值
const NULL_VALUE = '__NULL__'

interface TreeNode {
  id: string
  [key: string]: any
}

interface TreeOption {
  value: string | null
  label: string
  disabled?: boolean
}

// 允许传入根节点选项
const props = withDefaults(defineProps<{
  modelValue: string | null
  data: TreeNode[]
  labelKey?: string
  valueKey?: string
  placeholder?: string
  disabled?: boolean
  rootLabel?: string          // 新增：允许自定义根节点标签
  rootValue?: string | null   // 新增：允许自定义根节点值
  showRoot?: boolean          // 新增：是否显示根节点选项
}>(), {
  modelValue: null,
  labelKey: 'name',
  valueKey: 'id',
  placeholder: '请选择',
  disabled: false,
  rootLabel: '顶级节点',
  rootValue: null,
  showRoot: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
  (e: 'change', value: string | null): void
}>()

const selectedValue = computed({
  get: () => props.modelValue === null ? NULL_VALUE : props.modelValue,
  set: (val: string | null) => emit('update:modelValue', val === NULL_VALUE ? null : val)
})

// 将树形结构扁平化为选项数组
const normalizedOptions = computed(() => {
  const result: TreeOption[] = []

  // 如果需要显示根节点，则添加
  if (props.showRoot) {
    result.push({
      value: props.rootValue === null ? NULL_VALUE : props.rootValue,
      label: props.rootLabel
    })
  }

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

const handleChange = (value: string | null) => {
  emit('change', value === NULL_VALUE ? null : value)
}

// 监听数据变化
watch(() => props.data, () => {
  // 如果当前选中值不在选项中，重置选择
  if (selectedValue.value && !normalizedOptions.value.some(item => item.value === selectedValue.value)) {
    selectedValue.value = ''
  }
}, { deep: true })
</script>
