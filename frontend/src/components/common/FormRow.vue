<!-- frontend/src/components/common/FormRow.vue -->
<template>
  <el-row :gutter="gutter">
    <slot></slot>
  </el-row>
</template>

<script setup lang="ts">
defineProps({
  gutter: {
    type: Number,
    default: 20
  }
})
</script>
