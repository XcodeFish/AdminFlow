<template>
  <div class="menu-search">
    <el-form :model="searchForm" ref="formRef" inline>
      <el-form-item label="菜单名称" prop="menuName">
        <el-input v-model="searchForm.menuName" placeholder="请输入菜单名称" clearable @keyup.enter="handleSearch" />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="searchForm.status" placeholder="菜单状态" clearable>
          <el-option label="正常" :value="1" />
          <el-option label="停用" :value="0" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
        <el-button @click="handleReset" :icon="Refresh">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import type { QueryMenuParams } from '@/types/menu'

const emit = defineEmits<{
  (e: 'search', params: QueryMenuParams): void
  (e: 'reset'): void
}>()

const formRef = ref<FormInstance>()

// 搜索表单
const searchForm = reactive<QueryMenuParams>({
  menuName: '',
  status: undefined
})

// 搜索处理
const handleSearch = () => {
  emit('search', { ...searchForm })
}

// 重置处理
const handleReset = () => {
  formRef.value?.resetFields()
  emit('reset')
}
</script>

<style lang="scss" scoped>
.menu-search {
  padding: 18px;
  background-color: #f7f8fa;
  border-radius: 4px;
  margin-bottom: 15px;
}
</style>
