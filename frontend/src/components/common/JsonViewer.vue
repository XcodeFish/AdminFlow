<template>
  <div class="json-viewer">
    <pre v-if="typeof formattedValue === 'string'">{{ formattedValue }}</pre>
    <el-tree v-else :data="treeData" node-key="key" :default-expanded-keys="defaultExpandedKeys"
      :props="{ label: 'label', children: 'children' }">
      <template #default="{ node, data }">
        <span class="json-tree-node">
          <span class="json-key" :class="{ 'root-key': data.isRoot }">{{ data.key }}</span>
          <span v-if="!data.isObject" class="json-value" :class="getValueClass(data.value)">
            {{ formatValue(data.value) }}
          </span>
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface TreeNode {
  key: string
  label: string
  value: any
  isObject: boolean
  isRoot?: boolean
  children?: TreeNode[]
}

interface Props {
  value: any
  expandLevel?: number
}

const props = withDefaults(defineProps<Props>(), {
  expandLevel: 1
})

// 格式化为字符串
const formattedValue = computed(() => {
  if (props.value === null || props.value === undefined) {
    return String(props.value)
  }

  try {
    return typeof props.value === 'string'
      ? props.value
      : JSON.stringify(props.value, null, 2)
  } catch (e) {
    return String(props.value)
  }
})

// 默认展开的节点
const defaultExpandedKeys = ref<string[]>([])

// 将JSON对象转换为树结构
const treeData = computed<TreeNode[]>(() => {
  if (typeof props.value !== 'object' || props.value === null) {
    return [
      {
        key: 'root',
        label: 'root',
        value: props.value,
        isObject: false,
        isRoot: true
      }
    ]
  }

  const result: TreeNode[] = []
  const expandedKeys: string[] = []

  const formatObjectToTree = (obj: any, path: string = 'root', level: number = 0): TreeNode[] => {
    if (level <= props.expandLevel) {
      expandedKeys.push(path)
    }

    if (obj === null || obj === undefined) {
      return []
    }

    return Object.keys(obj).map(key => {
      const value = obj[key]
      const currentPath = `${path}.${key}`
      const isObject = value !== null && typeof value === 'object'

      const node: TreeNode = {
        key: currentPath,
        label: key,
        value,
        isObject
      }

      if (isObject) {
        node.children = formatObjectToTree(value, currentPath, level + 1)
      }

      return node
    })
  }

  // 处理根节点显示
  if (Array.isArray(props.value)) {
    result.push({
      key: 'root',
      label: 'Array',
      value: props.value,
      isObject: true,
      isRoot: true,
      children: formatObjectToTree(props.value, 'root')
    })
  } else {
    result.push({
      key: 'root',
      label: 'Object',
      value: props.value,
      isObject: true,
      isRoot: true,
      children: formatObjectToTree(props.value, 'root')
    })
  }

  defaultExpandedKeys.value = expandedKeys
  return result
})

// 根据值类型返回对应的CSS类
const getValueClass = (value: any): string => {
  if (value === null) return 'json-null'
  if (typeof value === 'number') return 'json-number'
  if (typeof value === 'boolean') return 'json-boolean'
  if (typeof value === 'string') return 'json-string'
  return ''
}

// 格式化值的显示
const formatValue = (value: any): string => {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return `"${value}"`
  return String(value)
}
</script>

<style lang="scss" scoped>
.json-viewer {
  font-family: monospace;
  font-size: 14px;
  background-color: #f8f8f8;
  border-radius: 4px;
  padding: 8px;
  overflow: auto;

  pre {
    margin: 0;
    white-space: pre-wrap;
  }

  .json-tree-node {
    display: flex;
    align-items: center;
  }

  .json-key {
    color: #881391;
    margin-right: 4px;

    &.root-key {
      font-weight: bold;
    }

    &:after {
      content: ":";
      margin-right: 4px;
    }
  }

  .json-value {
    &.json-string {
      color: #a31515;
    }

    &.json-number {
      color: #09885a;
    }

    &.json-boolean {
      color: #0000ff;
    }

    &.json-null {
      color: #0000ff;
    }
  }
}
</style>
