
<template>
  <div class="sidebar-container">
    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :active-text-color="variables.menuActiveText"
        :unique-opened="false"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item
          v-for="route in routes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePermissionStore } from '@/store/modules/permission'
import SidebarItem from './SidebarItem.vue'

// 样式变量
const variables = {
  menuBg: '#001529',
  menuText: '#bfcbd9',
  menuActiveText: '#409eff'
}

const permissionStore = usePermissionStore()
const route = useRoute()

// 计算当前激活的菜单项
const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta?.activeMenu) {
    return meta.activeMenu
  }
  return path
})

// 计算菜单是否折叠
const isCollapse = computed(() => false) // 可以通过store来控制

// 获取路由（菜单项）
const routes = computed(() => {
  // 过滤掉隐藏的菜单
  return permissionStore.routes.filter(route => {
    return !route.meta?.hidden
  })
})

// 组件挂载时，如果路由未加载，尝试加载
onMounted(async () => {
  if (permissionStore.routes.length === 0) {
    await permissionStore.loadPermissions()
  }
})
</script>

<style lang="scss" scoped>
.sidebar-container {
  height: 100%;
  background-color: v-bind('variables.menuBg');

  .el-scrollbar {
    height: 100%;
  }

  .el-menu {
    border-right: none;
  }
}
</style>
