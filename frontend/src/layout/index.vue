<template>
  <div class="app-wrapper">
    <div class="sidebar-container">
      <!-- 侧边栏 -->
    </div>
    <div class="main-container">
      <div class="header">
        <!-- 头部 -->
      </div>
      <div class="app-main">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 布局逻辑
</script>

<style lang="scss" scoped>
.app-wrapper {
  @apply flex h-full;

  .sidebar-container {
    @apply w-64 bg-gray-800 text-white;
  }

  .main-container {
    @apply flex flex-col flex-1 overflow-hidden;

    .header {
      @apply h-16 bg-white border-b border-gray-200;
    }

    .app-main {
      @apply flex-1 p-4 overflow-auto;
    }
  }
}
</style>
