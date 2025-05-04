<!-- frontend/src/components/common/FormCol.vue -->
<template>
  <el-col :span="span" :xs="xs" :sm="sm" :md="md" :lg="lg" :xl="xl">
    <slot></slot>
  </el-col>
</template>

<script setup lang="ts">
defineProps({
  span: {
    type: Number,
    default: 24
  },
  xs: Number,
  sm: Number,
  md: Number,
  lg: Number,
  xl: Number
})
</script>
