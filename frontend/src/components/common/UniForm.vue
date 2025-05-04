<!-- web/src/components/common/UniForm.vue -->
<template>
  <component :is="ElForm" v-bind="formAttrs">
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { ElForm } from 'element-plus'
import { computed } from 'vue'

const props = defineProps({
  model: {
    type: Object,
    default: () => ({})
  },
  inline: {
    type: Boolean,
    default: false
  },
  labelWidth: {
    type: String,
    default: 'auto'
  }
})


const formAttrs = computed(() => {
  // 创建新对象而不是直接修改props
  const { labelWidth, ...commonAttrs } = { ...props }
  return {
    ...commonAttrs,
    'label-width': labelWidth
  }

})
</script>
