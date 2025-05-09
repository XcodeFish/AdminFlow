<template>
  <div class="sidebar-container" :class="{ 'is-collapsed': isCollapse }">
    <!-- Logo区域 -->
    <div class="logo-container">
      <router-link to="/">
        <h1 class="logo-title" :class="{ 'collapsed-title': isCollapse }">
          {{ isCollapse ? appTitle.charAt(0) : appTitle }}
        </h1>
      </router-link>
    </div>

    <!-- 导航菜单 -->
    <error-boundary>
      <el-menu :default-active="activeMenu" class="el-menu-vertical" :collapse="isCollapse"
        :background-color="themeColors.background" :text-color="themeColors.text"
        :active-text-color="themeColors.active" :collapse-transition="false">
        <sidebar-item v-for="route in routes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>

      <!-- 错误时的回退UI -->
      <template #fallback>
        <div class="sidebar-error">
          <el-empty description="菜单加载失败" :image-size="50">
            <template #description>
              <p>导航菜单加载出错</p>
            </template>
            <el-button type="primary" size="small" @click="reloadRoutes">
              重新加载
            </el-button>
          </el-empty>
        </div>
      </template>
    </error-boundary>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePermissionStore } from '@/store/modules/permission'
import SidebarItem from './SidebarItem.vue'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import { globalErrorHandler } from '@/composables/useErrorHandler'

// 定义属性
interface Props {
  isCollapse: boolean
}

const props = defineProps<Props>()
const router = useRouter()
const route = useRoute()
const permissionStore = usePermissionStore()

// 应用标题
const appTitle = ref('Admin Flow')

// 主题颜色
const themeColors = ref({
  background: '#1e293b',
  text: '#fff',
  active: '#409EFF'
})

// 当前激活的菜单项
const activeMenu = computed(() => {
  try {
    const { meta, path } = route
    return meta?.activeMenu ? meta.activeMenu : path
  } catch (error) {
    // 处理路由信息读取错误
    globalErrorHandler.handleError(error, 'warning', {
      showMessage: false,
      showNotification: false,
      log: true
    })
    return '/'
  }
})

// 可访问的路由
const routes = computed(() => {
  try {
    // 直接使用permissionStore中的routes
    return permissionStore.routes.filter(route => {
      // 只显示不隐藏的路由，并且保留dashboard路由
      return (!route.meta?.hidden || route.path === '/') &&
        ((route.children?.length ?? 0) > 0 || route.name === 'Dashboard')
    })
  } catch (error) {
    console.error('获取路由失败:', error)
    return []
  }
})

// 重新加载路由信息
async function reloadRoutes() {
  try {
    console.log('重新加载路由配置...')
    await permissionStore.loadPermissions()
  } catch (error) {
    globalErrorHandler.handleError(error, 'error', {
      showNotification: true
    })
  }
}

// 组件挂载时初始化
onMounted(() => {
  if (permissionStore.routes.length === 0) {
    console.log('路由未加载，开始加载路由...')
    permissionStore.loadPermissions().catch(error => {
      console.error('加载路由出错:', error)
    })
  } else {
    console.log('路由已加载，路由数量:', permissionStore.routes.length)
  }
})
</script>

<style lang="scss" scoped>
.sidebar-container {
  background-color: v-bind('themeColors.background');
  color: v-bind('themeColors.text');
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  width: 220px;
  /* 展开时宽度 */
  transition: width 0.3s ease;
  /* 添加过渡效果 */

  &.is-collapsed {
    width: 64px;
    /* 收起时宽度 */
  }

  .logo-container {
    height: 4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;

    .logo-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: v-bind('themeColors.text');
      margin: 0;
      transition: font-size 0.3s ease;
      white-space: nowrap;

      &.collapsed-title {
        font-size: 1.5rem;
        /* 收起时字体放大 */
      }
    }
  }

  .el-menu-vertical {
    border-right: none;
    flex-grow: 1;
  }

  .sidebar-error {
    padding: 20px;
    margin-top: 30px;
    text-align: center;
    color: #f56c6c;
  }
}

/* 覆盖Element Plus菜单默认样式 */
:deep(.el-menu) {
  border-right: none !important;
}

:deep(.el-menu--collapse) {
  width: 64px;
}

/* 修复菜单项文字过长问题 */
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
