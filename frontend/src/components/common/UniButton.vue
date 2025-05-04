<template>

  <el-button :type="type" :size="getElementSize(size)" :disabled="disabled" :loading="loading" :plain="plain"
    :icon="icon" v-bind="$attrs" @click="handleClick">
    <slot></slot>
  </el-button>
</template>

<script setup lang="ts">
import { type ButtonType, type ButtonSize } from '@/types/ui'





// 定义组件属性
const props = defineProps({
  type: {
    type: String as () => ButtonType,
    default: 'default'
  },
  size: {
    type: String as () => ButtonSize,
    default: 'default'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  plain: {
    type: Boolean,
    default: false
  },
  icon: {
    type: [String, Object],
    default: ''
  }
})

// 定义事件
const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()


// 处理点击事件
const handleClick = (event: MouseEvent): void => {
  emit('click', event)
}


const getElementSize = (size: ButtonSize): 'default' | 'small' | 'large' => {
  if (size === 'medium' || size === 'middle') return 'default'
  return size as 'default' | 'small' | 'large'
}

</script>

<style lang="scss" scoped>
/* 按钮自定义样式可以在这里添加 */
</style>
