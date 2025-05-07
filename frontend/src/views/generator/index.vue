<template>
  <div class="generator-container">
    <el-card class="generator-card">
      <template #header>
        <div class="card-header">
          <h2>代码生成器</h2>
          <span>快速生成CRUD应用代码，提高开发效率</span>
        </div>
      </template>

      <div class="module-grid">
        <el-card
          v-for="(module, index) in modules"
          :key="index"
          class="module-card"
          shadow="hover"
          @click="navigateToModule(module.path)"
        >
          <div class="module-icon">
            <el-icon :size="32"><component :is="module.icon" /></el-icon>
          </div>
          <div class="module-info">
            <h3>{{ module.title }}</h3>
            <p>{{ module.description }}</p>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  DataBase,
  Table,
  Magic,
  Files,
  View,
  Management
} from '@element-plus/icons-vue'

const router = useRouter()

// 定义模块列表
const modules = ref([
  {
    title: '数据源管理',
    description: '配置和管理数据库连接',
    path: '/generator/datasource',
    icon: 'DataBase'
  },
  {
    title: '表结构管理',
    description: '管理和配置数据库表结构',
    path: '/generator/table',
    icon: 'Table'
  },
  {
    title: '代码向导',
    description: '使用向导生成应用代码',
    path: '/generator/wizard',
    icon: 'Magic'
  },
  {
    title: '配置管理',
    description: '管理生成器配置和模板',
    path: '/generator/config',
    icon: 'Management'
  },
  {
    title: '代码预览',
    description: '预览和编辑生成的代码',
    path: '/generator/preview',
    icon: 'View'
  },
  {
    title: '版本管理',
    description: '管理生成代码的版本',
    path: '/generator/version',
    icon: 'Files'
  }
])

// 导航到指定模块
const navigateToModule = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.generator-container {
  padding: 20px;
}

.generator-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  flex-direction: column;
}

.card-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

.card-header span {
  color: #909399;
  font-size: 14px;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.module-card {
  cursor: pointer;
  transition: transform 0.3s;
  display: flex;
  align-items: center;
  padding: 16px;
}

.module-card:hover {
  transform: translateY(-5px);
}

.module-icon {
  padding: 16px;
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
  border-radius: 8px;
  margin-right: 16px;
}

.module-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.module-info p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}
</style>
