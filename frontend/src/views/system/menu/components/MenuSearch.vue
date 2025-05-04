<template>
  <div class="menu-search-wrapper">
    <SearchPanel placeholder="请输入菜单名称" position="left" @search="handleSearch" @reset="handleReset" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SearchPanel from '@/components/common/SearchPanel.vue'
import type { QueryMenuParams } from '@/types/menu'

const emit = defineEmits<{
  (e: 'search', params: QueryMenuParams): void
  (e: 'reset'): void
}>()

// 搜索处理
const handleSearch = (searchText: string) => {
  emit('search', { menuName: searchText })
}

// 重置处理
const handleReset = () => {
  emit('reset')
}
</script>

<style lang="scss" scoped>
.menu-search-wrapper {
  width: 100%;
  max-width: 300px;
}
</style>
