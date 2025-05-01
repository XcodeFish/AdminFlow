<template>
  <div class="app-wrapper">
    <div class="sidebar-container">
      <!-- 侧边栏 -->
      <div class="logo-container">
        <router-link to="/">
          <h1 class="logo-title">Admin Flow</h1>
        </router-link>
      </div>

      <!-- 导航菜单 -->
      <el-menu :default-active="activeMenu" class="el-menu-vertical" background-color="#1e293b" text-color="#fff"
        active-text-color="#409EFF">
        <el-menu-item index="/dashboard" @click="navigateTo('/dashboard')">
          <el-icon>
            <Monitor />
          </el-icon>
          <span>仪表盘</span>
        </el-menu-item>

        <el-sub-menu index="system">
          <template #title>
            <el-icon>
              <Setting />
            </el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/system/user" @click="navigateTo('/system/user')">
            <el-icon>
              <User />
            </el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/system/role" @click="navigateTo('/system/role')">
            <el-icon>
              <UserFilled />
            </el-icon>
            <span>角色管理</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>

    <div class="main-container">
      <div class="header">
        <!-- 头部 -->
        <div class="header-left">
          <el-icon class="toggle-sidebar">
            <Fold />
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
                <el-dropdown-item>个人中心</el-dropdown-item>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Monitor,
  Setting,
  User,
  UserFilled,
  Fold,
  ArrowDown
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 激活的菜单项
const activeMenu = computed(() => {
  return route.path
})

// 当前路由名称
const currentRoute = computed(() => {
  return route.meta.title || '仪表盘'
})

// 用户名
const username = computed(() => {
  return userStore.userInfo?.nickname || userStore.userInfo?.username || '用户'
})

// 导航方法
const navigateTo = (path: string) => {
  router.push(path)
}

// 退出登录
const handleLogout = async () => {
  try {
    await userStore.logoutAction()
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}
</script>

<style lang="scss" scoped>
.app-wrapper {
  display: flex;
  height: 100vh;

  .sidebar-container {
    width: 16rem;
    background-color: #1e293b;
    color: white;
    overflow-y: auto;

    .logo-container {
      height: 4rem;
      display: flex;
      align-items: center;
      justify-content: center;

      .logo-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: white;
      }
    }

    .el-menu-vertical {
      border-right: none;
    }
  }

  .main-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;

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
        }
      }

      .header-right {
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
</style>
