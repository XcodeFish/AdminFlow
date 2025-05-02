<template>
  <div class="icon-select">
    <el-input v-model="selectedIcon" :placeholder="placeholder" :disabled="disabled" :clearable="clearable"
      @click="showDialog = true">
      <template #prefix>
        <component :is="resolvedIcon" v-if="selectedIcon" />
        <i v-else class="el-icon-plus"></i>
      </template>
    </el-input>

    <el-dialog title="选择图标" v-model="showDialog" width="780px" append-to-body>
      <div class="icon-grid">
        <div v-for="icon in iconList" :key="icon.name" class="icon-item" :class="{ active: selectedIcon === icon.name }"
          @click="handleSelectIcon(icon.name)">
          <component :is="icon.component" />
          <span class="icon-name">{{ icon.name }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import * as ElementPlusIcons from '@element-plus/icons-vue'

const props = withDefaults(defineProps<{
  modelValue: string | null
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
}>(), {
  placeholder: '点击选择图标',
  disabled: false,
  clearable: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
  (e: 'change', value: string | null): void
}>()

const showDialog = ref(false)

const selectedIcon = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
    emit('change', val)
  }
})

// 解析已选图标
const resolvedIcon = computed(() => {
  if (!selectedIcon.value) return null
  return (ElementPlusIcons as Record<string, any>)[selectedIcon.value] || null
})

// 图标列表
const iconList = computed(() => {
  return Object.entries(ElementPlusIcons).map(([name, component]) => ({
    name,
    component
  }))
})

// 选择图标
const handleSelectIcon = (iconName: string) => {
  selectedIcon.value = iconName
  showDialog.value = false
}
</script>

<style lang="scss" scoped>
.icon-select {
  width: 100%;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  max-height: 500px;
  overflow-y: auto;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px 5px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    background-color: #f0f9ff;
  }

  &.active {
    background-color: #ecf5ff;
    color: #409eff;
  }

  .icon-name {
    margin-top: 8px;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
}
</style>
