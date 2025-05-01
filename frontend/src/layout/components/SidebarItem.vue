<template>
  <!-- 如果没有子菜单，并且不隐藏 -->
  <el-menu-item v-if="!hasOneShowingChild(item.children, item) && !item.meta?.hidden" :index="resolvePath(basePath)"
    @click="navigateTo(resolvePath(basePath))">
    <el-icon v-if="item.meta?.icon">
      <component :is="item.meta.icon" />
    </el-icon>
    <template #title>
      <span class="menu-title">{{ item.meta?.title }}</span>
    </template>
  </el-menu-item>

  <!-- 如果有一个子菜单 -->
  <template v-else-if="onlyOneChild && !onlyOneChild.meta?.hidden">
    <el-menu-item :index="resolvePath(onlyOneChild.path)" @click="navigateTo(resolvePath(onlyOneChild.path))">
      <el-icon v-if="onlyOneChild.meta?.icon">
        <component :is="onlyOneChild.meta.icon" />
      </el-icon>
      <template #title>
        <span class="menu-title">{{ onlyOneChild.meta?.title }}</span>
      </template>
    </el-menu-item>
  </template>

  <!-- 如果有多个子菜单 -->
  <el-sub-menu v-else :index="resolvePath(basePath)" teleported :popper-class="'sidebar-popper'">
    <template #title>
      <el-icon v-if="item.meta?.icon">
        <component :is="item.meta.icon" />
      </el-icon>
      <span class="menu-title">{{ item.meta?.title }}</span>
    </template>

    <!-- 递归渲染子菜单 -->
    <sidebar-item v-for="child in item.children" :key="child.path" :item="child" :base-path="resolvePath(child.path)" />
  </el-sub-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { isExternal } from '@/utils/validate'
import path from 'path-browserify'
import { globalErrorHandler } from '@/composables/useErrorHandler'

interface RouteItem {
  path: string
  name?: string
  meta?: {
    title?: string
    icon?: string
    hidden?: boolean
    activeMenu?: string
    [key: string]: any
  }
  children?: RouteItem[]
  [key: string]: any
}

// 属性定义
interface Props {
  item: RouteItem
  basePath: string
}

const props = defineProps<Props>()
const router = useRouter()
const onlyOneChild = ref<RouteItem | null>(null)

/**
 * 判断是否只有一个显示的子菜单
 */
const hasOneShowingChild = (children: RouteItem[] = [], parent: RouteItem): boolean => {
  try {
    if (!children) {
      children = []
    }

    // 过滤出不隐藏的子菜单
    const showingChildren = children.filter(item => {
      if (item.meta?.hidden) {
        return false
      }
      // 当前项作为唯一子项
      onlyOneChild.value = item
      return true
    })

    // 没有子菜单，使用父级
    if (showingChildren.length === 0) {
      onlyOneChild.value = { ...parent, path: '' }
      return true
    }

    return showingChildren.length === 1
  } catch (error) {
    // 处理错误
    globalErrorHandler.handleError(error, 'warning', {
      showMessage: false,
      showNotification: false,
      log: true
    })

    // 出错时返回保守结果，使用父级
    onlyOneChild.value = { ...parent, path: '' }
    return true
  }
}

/**
 * 解析路径
 */
const resolvePath = (routePath: string): string => {
  try {
    if (isExternal(routePath)) {
      return routePath
    }
    if (isExternal(props.basePath)) {
      return props.basePath
    }

    // 兼容windowsPath
    return path.resolve(props.basePath, routePath).replace(/\\/g, '/')
  } catch (error) {
    // 处理错误
    globalErrorHandler.handleError(error, 'warning', {
      showMessage: false,
      log: true
    })

    // 错误时返回源路径
    return routePath || props.basePath || '/'
  }
}

/**
 * 导航到指定路径
 */
const navigateTo = (path: string): void => {
  try {
    if (isExternal(path)) {
      window.open(path, '_blank')
      return
    }
    router.push(path)
  } catch (error) {
    // 处理导航错误
    globalErrorHandler.handleError(error, 'error', {
      showMessage: true,
      log: true
    })
  }
}
</script>

<style lang="scss" scoped>
// 菜单标题
.menu-title {
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 150px;
}

// 多级菜单缩进
:deep(.el-sub-menu .el-menu-item) {
  padding-left: 52px !important;
}

:deep(.el-sub-menu .el-sub-menu .el-menu-item) {
  padding-left: 68px !important;
}

:deep(.el-menu-item, .el-sub-menu) {
  border-radius: 4px;
  margin: 4px 8px;
  width: calc(100% - 16px);
}

// 增强图标在折叠状态下的可见性
:deep(.el-menu--collapse) {

  .el-menu-item,
  .el-sub-menu__title {
    .el-icon {
      margin-right: 0;
      margin-left: 0;
      font-size: 18px;
      text-align: center;
      width: 100%;
    }
  }
}

// 优化弹出子菜单样式
:global(.sidebar-popper) {
  .el-menu {
    background-color: #2c3e50 !important; // 深色背景

    .el-menu-item {
      color: #ffffff;

      &:hover,
      &.is-active {
        background-color: #1e293b;
      }
    }
  }
}
</style>
