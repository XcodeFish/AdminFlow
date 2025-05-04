<template>
  <div class="search-panel" :class="panelPosition">
    <div class="search-container">
      <el-input v-model="searchText" :placeholder="placeholder" class="search-input" clearable />
      <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        <el-button type="primary" :icon="Refresh" class="reset-button" @click="handleReset">重置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Element Plus 图标
import { Search, Refresh } from '@element-plus/icons-vue'

// 定义组件属性
const props = defineProps({
  placeholder: {
    type: String,
    default: '请输入搜索内容'
  },
  position: {
    type: String,
    default: 'left',
    validator: (value: string) => ['left', 'center', 'right'].includes(value)
  }
})

// 定义组件事件
const emit = defineEmits(['search', 'reset'])

// 搜索文本
const searchText = ref('')


// 计算面板位置样式
const panelPosition = computed(() => `position-${props.position}`)

// 搜索处理
const handleSearch = () => {
  emit('search', searchText.value)
}

// 重置处理
const handleReset = () => {
  searchText.value = ''
  emit('reset')
}
</script>

<style lang="scss" scoped>
.search-panel {
  margin-bottom: 0;
  width: auto;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  width: 200px;
}

/* Element Plus 重置按钮样式调整 */
:deep(.el-button) {
  &:hover {
    background-color: rgb(121,
        187,
        255);
    color: white;
  }
}


/* 位置控制 */
.position-left {
  justify-content: flex-start;
}

.position-center {
  justify-content: center;
}

.position-right {
  justify-content: flex-end;
}
</style>
