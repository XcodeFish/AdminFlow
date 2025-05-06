<template>
  <div class="icon-display">
    <!-- Element Plus 图标 -->
    <el-icon v-if="icon && !isIconify" class="menu-icon">
      <component :is="resolvedIcon" />
    </el-icon>

    <!-- Iconify 图标 -->
    <Icon v-else-if="icon && isIconify" :icon="icon" class="menu-icon" />

    <!-- 图标名称 -->
    <span class="icon-name" v-if="showName && icon">{{ icon }}</span>

    <!-- 无图标 -->
    <span v-if="!icon" class="no-icon">-</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import * as ElementPlusIcons from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  icon: string | null
  showName?: boolean
}>()

// 判断是否为Iconify图标
const isIconify = computed(() => {
  return props.icon ? props.icon.includes(':') : false
})

// 解析Element Plus图标组件
const resolvedIcon = computed(() => {
  if (!props.icon || isIconify.value) return null

  // 检查是否为Element Plus图标
  if ((ElementPlusIcons as Record<string, any>)[props.icon]) {
    return props.icon
  }

  return null
})
</script>

<style lang="scss" scoped>
.icon-display {
  display: flex;
  align-items: center;
  gap: 5px;

  .menu-icon {
    font-size: 18px;
    width: 1em;
    height: 1em;
  }

  .icon-name {
    font-size: 13px;
    color: #606266;
  }

  .no-icon {
    color: #909399;
  }
}
</style>
