<!-- web/src/components/common/UniFormItem.vue -->
<template>
  <component :is="ElFormItem" v-bind="formItemAttrs">
    <template #label>{{ label }}</template>
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { ElFormItem } from 'element-plus'
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  prop: {
    type: String,
    default: ''
  }
})

const formItemAttrs = computed(() => {
  const commonAttrs = { ...props }

  return commonAttrs
})
</script>
