<template>
  <div v-if="!item.meta || !item.meta.hidden">
    <!-- 渲染单个路由，没有子路由或只有一个子路由 -->
    <template
      v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !item.alwaysShow">
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)">
          <el-icon v-if="onlyOneChild.meta.icon">
            <component :is="onlyOneChild.meta.icon" />
          </el-icon>
          <template #title>
            {{ onlyOneChild.meta.title }}
          </template>
        </el-menu-item>
      </app-link>
    </template>

    <!-- 渲染子菜单 -->
    <el-sub-menu v-else :index="resolvePath(item.path)" popper-append-to-body>
      <template #title>
        <el-icon v-if="item.meta && item.meta.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <span v-if="item.meta && item.meta.title">{{ item.meta.title }}</span>
      </template>

      <!-- 递归渲染子菜单项 -->
      <sidebar-item v-for="child in item.children" :key="child.path" :item="child"
        :base-path="resolvePath(child.path)" />
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouteRecordRaw } from 'vue-router'
import { useRouter } from 'vue-router'
import { isExternal } from '@/utils/validate'
import AppLink from './Link.vue'
import { globalErrorHandler } from '@/composables/useErrorHandler'

const router = useRouter()

const props = defineProps({
  item: {
    type: Object as () => RouteRecordRaw,
    required: true
  },
  basePath: {
    type: String,
    default: ''
  }
})

// 存储唯一子路由
const onlyOneChild = ref<any>(null)

/**
 * 判断是否只有一个显示的子路由
 */
function hasOneShowingChild(children: RouteRecordRaw[] = [], parent: RouteRecordRaw) {
  if (!children) {
    children = []
  }

  // 过滤掉隐藏的路由
  const showingChildren = children.filter(item => {
    if (item.meta && item.meta.hidden) {
      return false
    }
    return true
  })

  // 如果只有一个子路由，则直接显示子路由
  if (showingChildren.length === 1) {
    onlyOneChild.value = showingChildren[0]
    return true
  }

  // 如果没有子路由，则显示父路由
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true }
    return true
  }

  return false
}

/**
 * 解析路径，处理嵌套路由路径
 */
function resolvePath(routePath: string) {
  if (isExternal(routePath)) {
    return routePath
  }

  if (isExternal(props.basePath)) {
    return props.basePath
  }

  // 处理完整路径
  if (routePath.startsWith('/')) {
    return routePath
  }

  // 清理路径，确保没有双斜杠
  const cleanRoutePath = routePath.startsWith('/') ? routePath.slice(1) : routePath

  // 检查子路径是否已经包含在父路径中，避免重复路径段
  if (props.basePath && cleanRoutePath) {
    const basePathSegments = props.basePath.split('/').filter(Boolean)
    const routePathSegments = cleanRoutePath.split('/').filter(Boolean)

    // 检查第一个路径段是否重复
    if (routePathSegments.length > 0 &&
      basePathSegments.length > 0 &&
      basePathSegments[basePathSegments.length - 1] === routePathSegments[0]) {
      // 移除子路径的第一个段，因为它已经包含在父路径中
      routePathSegments.shift()
      const newRoutePath = routePathSegments.join('/')
      const basePathClean = props.basePath.endsWith('/') ? props.basePath.slice(0, -1) : props.basePath
      return newRoutePath ? `${basePathClean}/${newRoutePath}` : basePathClean
    }
  }

  // 标准路径拼接逻辑
  if (props.basePath) {
    const basePathClean = props.basePath.endsWith('/') ? props.basePath.slice(0, -1) : props.basePath
    return cleanRoutePath ? `${basePathClean}/${cleanRoutePath}` : basePathClean
  }

  return cleanRoutePath
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
