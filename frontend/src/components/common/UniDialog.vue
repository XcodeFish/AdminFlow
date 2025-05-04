<template>
  <!-- Element Plus对话框 -->
  <el-dialog :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" :title="title"
    :width="width" v-bind="$attrs" @close="close">
    <slot></slot>
    <template v-if="!hasFooter" #footer>
      <slot name="footer"></slot>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">

// 定义组件属性
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '50%'
  },
  hasFooter: {
    type: Boolean,
    default: false
  }
})

// 定义事件
const emit = defineEmits(['update:modelValue', 'close'])

// 关闭对话框
const close = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped>
/* 对话框自定义样式 */
:deep(.el-dialog__body) {
  padding: 20px;
}

</style>
