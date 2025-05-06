<template>
  <div class="icon-selector">
    <!-- 图标库选择 -->
    <el-select v-model="currentIconSet" placeholder="选择图标库" class="icon-set-select">
      <el-option v-for="set in iconSets" :key="set.value" :label="set.label" :value="set.value" />
    </el-select>

    <!-- 搜索框 -->
    <el-input v-model="searchTerm" placeholder="搜索图标" class="icon-search">
      <template #prefix>
        <el-icon>
          <Search />
        </el-icon>
      </template>
    </el-input>

    <!-- 已选择的图标 -->
    <div v-if="selectedIcon" class="selected-icon">
      <el-tag closable @close="clearSelection">
        <span v-if="isIconify">
          <Icon :icon="selectedIcon" />
        </span>
        <el-icon v-else>
          <component :is="selectedIcon" />
        </el-icon>
        <span class="icon-name">{{ selectedIcon }}</span>
      </el-tag>
    </div>

    <!-- 自定义图标输入 -->
    <div class="custom-icon-input">
      <el-input v-model="customIconName" placeholder="输入自定义图标名称 (如 mdi:home)">
        <template #append>
          <el-button @click="selectCustomIcon" :disabled="!isValidIconName">使用</el-button>
        </template>
      </el-input>
      <div class="preview-area">
        <el-button v-if="customIconName" type="text" @click="previewCustomIcon">预览图标</el-button>
        <div v-if="customIconName && customIconPreview" class="custom-preview">
          <Icon v-if="isValidIconName" :icon="customIconName" />
          <span v-if="isValidIconName">图标预览</span>
          <span v-else class="error-text">无效的图标名称，请使用 prefix:name 格式</span>
        </div>
      </div>
    </div>

    <!-- 图标列表 -->
    <div class="icons-container">
      <!-- 加载中状态 -->
      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
        <span>加载图标中...</span>
      </div>

      <!-- 无结果状态 -->
      <div v-if="!loading && filteredIcons.length === 0" class="no-results">
        <el-icon>
          <CircleClose />
        </el-icon>
        <span>未找到图标，请尝试其他关键词</span>
      </div>

      <!-- Element Plus 图标 -->
      <template v-if="currentIconSet === 'element-plus' && !loading">
        <div v-for="icon in filteredIcons" :key="icon" @click="selectIcon(icon, false)" class="icon-item"
          :class="{ active: selectedIcon === icon && !isIconify }">
          <el-icon>
            <component :is="icon" />
          </el-icon>
          <span class="icon-name">{{ icon }}</span>
        </div>
      </template>

      <!-- Iconify 图标 -->
      <template v-if="currentIconSet !== 'element-plus' && !loading">
        <div v-for="icon in filteredIcons" :key="icon" @click="selectIcon(icon, true)" class="icon-item"
          :class="{ active: selectedIcon === icon && isIconify }">
          <Icon :icon="icon" />
          <span class="icon-name">{{ getIconShortName(icon) }}</span>
        </div>
      </template>
    </div>

    <!-- 图标集浏览提示 -->
    <div class="browse-tip">
      <el-button type="text" @click="openIconBrowser">
        <el-icon>
          <Link />
        </el-icon>
        浏览更多图标
      </el-button>
      <span class="tip-text">可在官方网站浏览更多图标并复制名称</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Search, Loading, CircleClose, Link } from '@element-plus/icons-vue'
import * as EpIcons from '@element-plus/icons-vue' // Element Plus图标
import { Icon } from '@iconify/vue' // Iconify图标组件
import { ElMessage } from 'element-plus'
import { allMenuIcons } from '@/components/icons/menuIcons' // 导入菜单图标定义

// 图标集定义
const iconSets = [
  { label: 'Element Plus', value: 'element-plus' },
  { label: 'Material Icons', value: 'material-symbols' },
  { label: 'Material Design Icons', value: 'mdi' },
  { label: 'Font Awesome', value: 'fa6-solid' },
  { label: 'Bootstrap Icons', value: 'bi' }
]

// 获取Element Plus图标名称
const epIconNames = Object.keys(EpIcons)

// 常用的Iconify图标 (每个集合的前20个常用图标)
const commonIcons = allMenuIcons

// 图标集对应的官方浏览网址
const iconBrowserUrls = {
  'material-symbols': 'https://icon-sets.iconify.design/material-symbols/',
  'mdi': 'https://icon-sets.iconify.design/mdi/',
  'fa6-solid': 'https://icon-sets.iconify.design/fa6-solid/',
  'bi': 'https://icon-sets.iconify.design/bi/'
}

// 组件属性
const props = defineProps<{
  modelValue: string | null
}>()

// 组件事件
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

// 当前状态
const loading = ref(false)
const searchTerm = ref('')
const currentIconSet = ref('element-plus')
const isIconify = ref(false) // 标记当前选中的是否为Iconify图标
const customIconName = ref('') // 自定义图标名称
const customIconPreview = ref(false) // 是否显示自定义图标预览

// 当前选择的图标
const selectedIcon = computed({
  get: () => props.modelValue,
  set: (value: string | null) => {
    emit('update:modelValue', value)
  }
})

// 是否是有效的图标名称
const isValidIconName = computed(() => {
  return customIconName.value && customIconName.value.includes(':')
})

// 过滤后的图标
const filteredIcons = computed(() => {
  if (currentIconSet.value === 'element-plus') {
    return searchTerm.value
      ? epIconNames.filter(name => name.toLowerCase().includes(searchTerm.value.toLowerCase()))
      : epIconNames
  } else {
    const icons = commonIcons[currentIconSet.value as keyof typeof allMenuIcons] || []
    return searchTerm.value
      ? icons.filter((icon: string) => icon.toLowerCase().includes(searchTerm.value.toLowerCase()))
      : icons
  }
})

// 获取Iconify图标的短名称(去掉前缀)
const getIconShortName = (iconName: string) => {
  return iconName.split(':').pop() || iconName
}

// 选择图标
const selectIcon = (iconName: string, isIconifyIcon: boolean) => {
  selectedIcon.value = iconName
  isIconify.value = isIconifyIcon
}

// 清除选择
const clearSelection = () => {
  selectedIcon.value = null
  isIconify.value = false
}

// 打开图标浏览器
const openIconBrowser = () => {
  const url = currentIconSet.value === 'element-plus'
    ? 'https://element-plus.org/zh-CN/component/icon.html'
    : iconBrowserUrls[currentIconSet.value as keyof typeof iconBrowserUrls]

  window.open(url, '_blank')
}

// 预览自定义图标
const previewCustomIcon = () => {
  if (!customIconName.value) {
    ElMessage.warning('请输入图标名称')
    return
  }

  customIconPreview.value = true
}

// 选择自定义图标
const selectCustomIcon = () => {
  if (!isValidIconName.value) {
    ElMessage.warning('请输入有效的图标名称，格式为: 前缀:名称')
    return
  }

  selectIcon(customIconName.value, true)
  customIconName.value = ''
  customIconPreview.value = false
}

// 监听modelValue变化
watch(() => props.modelValue, (val) => {
  if (!val) return

  // 判断是否为Iconify图标(包含:分隔符)
  isIconify.value = val.includes(':')

  if (!isIconify.value && !epIconNames.includes(val)) {
    console.warn(`Icon "${val}" does not exist in Element Plus icons`)
  } else if (isIconify.value) {
    // 如果是Iconify图标，切换到对应的图标集
    const prefix = val.split(':')[0]
    const matchedSet = iconSets.find(set => set.value === prefix)
    if (matchedSet) {
      currentIconSet.value = matchedSet.value
    }
  }
})

// 初始化
onMounted(() => {
  // 如果已经选择了图标，判断是否为Iconify图标
  if (props.modelValue) {
    isIconify.value = props.modelValue.includes(':')
    if (isIconify.value) {
      const prefix = props.modelValue.split(':')[0]
      const matchedSet = iconSets.find(set => set.value === prefix)
      if (matchedSet) {
        currentIconSet.value = matchedSet.value
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.icon-selector {
  width: 100%;
}

.icon-set-select {
  width: 100%;
  margin-bottom: 10px;
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

.custom-icon-input {
  margin-bottom: 15px;
}

.preview-area {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 5px;
}

.custom-preview {
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;

  svg {
    font-size: 24px;
    color: #409eff;
  }

  .error-text {
    color: #f56c6c;
  }
}

.icons-container {
  height: 250px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
}

.loading-container,
.no-results {
  grid-column: 1 / -1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #909399;

  .el-icon,
  svg {
    font-size: 24px;
  }
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

  .el-icon,
  svg {
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

.browse-tip {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .tip-text {
    font-size: 12px;
    color: #909399;
  }
}
</style>
