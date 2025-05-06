<template>
  <div class="logger-detail-container">
    <LogDetail />
  </div>
</template>

<script setup lang="ts">
import LogDetail from './components/LogDetail.vue'
</script>

<style lang="scss" scoped>
.logger-detail-container {
  min-height: calc(100vh - 180px);
}
</style>
