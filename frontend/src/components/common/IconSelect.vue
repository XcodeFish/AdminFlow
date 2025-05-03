<template>
  <div class="icon-selector">
    <el-input v-model="searchTerm" placeholder="搜索图标" class="icon-search">
      <template #prefix>
        <el-icon>
          <Search />
        </el-icon>
      </template>
    </el-input>
    <div v-if="selectedIcon" class="selected-icon">
      <el-tag closable @close="clearSelection">
        <el-icon>
          <component :is="selectedIcon" />
        </el-icon>
        <span class="icon-name">{{ selectedIcon }}</span>
      </el-tag>
    </div>
    <div class="icons-container">
      <div v-for="icon in filteredIcons" :key="icon" @click="selectIcon(icon)" class="icon-item"
        :class="{ active: selectedIcon === icon }">
        <el-icon>
          <component :is="icon" />
        </el-icon>
        <span class="icon-name">{{ icon }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import * as Icons from '@element-plus/icons-vue' // 导入所有图标

// 获取所有图标名称
const iconNames = Object.keys(Icons)

// 组件属性
const props = defineProps<{
  modelValue: string | null
}>()

// 组件事件
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

// 搜索关键字
const searchTerm = ref('')

// 当前选择的图标
const selectedIcon = computed({
  get: () => props.modelValue,
  set: (value: string | null) => {
    emit('update:modelValue', value)
  }
})

// 过滤后的图标列表
const filteredIcons = computed(() => {
  if (!searchTerm.value) {
    return iconNames
  }
  return iconNames.filter(name =>
    name.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

// 选择图标
const selectIcon = (iconName: string) => {
  selectedIcon.value = iconName
}

// 清除选择
const clearSelection = () => {
  selectedIcon.value = null
}

// 监听modelValue变化
watch(() => props.modelValue, (val) => {
  if (val && !iconNames.includes(val)) {
    console.warn(`Icon "${val}" does not exist in Element Plus icons`)
  }
})
</script>

<style lang="scss" scoped>
.icon-selector {
  width: 100%;
}

.icon-search {
  margin-bottom: 10px;
}

.selected-icon {
  margin-bottom: 10px;

  .el-tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
}

.icons-container {
  height: 200px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    background-color: #f5f7fa;
  }

  &.active {
    background-color: #ecf5ff;
    color: #409eff;
  }

  .el-icon {
    font-size: 20px;
    margin-bottom: 5px;
  }

  .icon-name {
    font-size: 12px;
    word-break: break-all;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }
}
</style>
