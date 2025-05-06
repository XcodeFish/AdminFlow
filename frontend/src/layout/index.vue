<template>
  <div class="app-wrapper" :class="{ 'sidebar-collapsed': isCollapse }">
    <!-- 使用封装的侧边栏组件 -->
    <sidebar :is-collapse="isCollapse" />

    <div class="main-container">
      <div class="header">
        <!-- 头部 -->
        <div class="header-left">
          <el-icon class="toggle-sidebar" @click="toggleSidebar">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentRoute }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-dropdown trigger="click">
            <div class="avatar-container">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="username">{{ username }}</span>
              <el-icon>
                <ArrowDown />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="openUserProfile">个人中心</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <div class="app-main">
        <router-view />
      </div>
    </div>
    <UserProfile v-model:visible="userProfileVisible" :user-info="currentUser" @refresh="fetchUserInfo" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Fold,
  Expand,
  ArrowDown
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import Sidebar from './components/Sidebar.vue'
import { globalErrorHandler } from '@/composables/useErrorHandler'
import UserProfile from '@/views/profile/index.vue'
import type { User } from '@/types/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 侧边栏收起状态
const isCollapse = ref(false)
const userProfileVisible = ref(false)
const currentUser = ref<User>({})

// 切换侧边栏
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value

  // 保存侧边栏状态到本地存储，以便刷新页面后保持状态
  try {
    localStorage.setItem('sidebarStatus', isCollapse.value ? '1' : '0')
  } catch (error) {
    globalErrorHandler.handleError(error, 'warning', {
      showMessage: false,
      log: true
    })
  }
}

// 当前路由名称
const currentRoute = computed(() => {
  return route.meta.title || '仪表盘'
})

// 用户名
const username = computed(() => {
  return userStore.userInfo?.nickname || userStore.userInfo?.username || '用户'
})

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    currentUser.value = await userStore.getUserInfo
  } catch (error) {
    console.error('获取用户信息失败', error)
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    // 先保存路由实例的引用，以防logoutAction中清除了$router
    const routerInstance = router

    // 执行登出操作
    await userStore.logoutAction()

    // 确保完全刷新URL状态，使用replace避免返回按钮返回到已登出状态
    try {
      await routerInstance.replace('/login')
    } catch (navigationError) {
      console.error('🚨 路由跳转失败，尝试使用location.href:', navigationError)
      // 如果路由跳转失败，使用原生方法强制跳转
      window.location.href = '/login'
    }

    // 打印调试信息
    console.log('🚩 用户已登出，已重定向到登录页')
  } catch (error) {
    globalErrorHandler.handleError(error, 'error', {
      showMessage: true
    })
    // 即使登出失败，也尝试跳转到登录页
    window.location.href = '/login'
  }
}

// 打开个人信息弹框
const openUserProfile = () => {
  userProfileVisible.value = true
}


// 初始化侧边栏状态（从本地存储读取）
(() => {
  try {
    const sidebarStatus = localStorage.getItem('sidebarStatus')
    if (sidebarStatus) {
      isCollapse.value = sidebarStatus === '1'
    }
  } catch (error) {
    console.error('读取侧边栏状态失败:', error)
  }
})()

onMounted(async () => {
  await fetchUserInfo()
})
</script>

<style lang="scss" scoped>
.app-wrapper {
  display: flex;
  height: 100vh;
  transition: all 0.3s ease;

  // 主容器占用剩余空间
  .main-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    transition: margin-left 0.3s ease;

    .header {
      height: 4rem;
      background-color: white;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1rem;

      .header-left {
        display: flex;
        align-items: center;

        .toggle-sidebar {
          color: #6b7280;
          margin-right: 1rem;
          font-size: 1.25rem;
          cursor: pointer;
          transition: transform 0.3s;

          &:hover {
            color: #409EFF;
          }
        }
      }

      .header-right {
        display: flex;
        align-items: center;

        .avatar-container {
          display: flex;
          align-items: center;
          cursor: pointer;

          .username {
            margin: 0 0.5rem;
            font-size: 0.875rem;
          }
        }
      }
    }

    .app-main {
      flex: 1;
      padding: 1rem;
      overflow: auto;
      background-color: #f9fafb;
    }
  }
}

// 侧边栏过渡效果
@media (min-width: 768px) {
  .sidebar-collapsed {
    .main-container {
      margin-left: 0;
    }
  }
}

// 移动端适配
@media (max-width: 767px) {
  .app-wrapper {
    position: relative;

    .main-container {
      margin-left: 0;
    }
  }
}
</style>
