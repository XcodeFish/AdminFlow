<template>
  <div class="icon-display">
    <component :is="resolvedIcon" v-if="icon" class="menu-icon" />
    <span class="icon-name" v-if="showName && icon">{{ icon }}</span>
    <span v-if="!icon" class="no-icon">-</span>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import * as ElementPlusIcons from '@element-plus/icons-vue'

const props = defineProps<{
  icon: string | null
  showName?: boolean
}>()

// 解析图标组件
const resolvedIcon = computed(() => {
  if (!props.icon) return null

  // 1. 在Element Plus Icons中查找
  if ((ElementPlusIcons as Record<string, any>)[props.icon]) {
    return (ElementPlusIcons as Record<string, any>)[props.icon]
  }

  // 2. 尝试从根app实例获取组件
  const instance = getCurrentInstance()
  if (instance && instance.appContext.app) {
    // 尝试从Vue应用实例获取组件
    try {
      return instance.appContext.app.component(props.icon)
    } catch (e) {
      console.warn('无法从应用实例获取图标组件:', props.icon)
    }
  }

  // 3. 尝试使用resolveComponent
  try {
    // 尝试使用appContext中的解析方法
    const comp = instance?.appContext.components[props.icon]
    if (comp) return comp
  } catch (e) {
    console.warn('图标解析失败:', props.icon, e)
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
