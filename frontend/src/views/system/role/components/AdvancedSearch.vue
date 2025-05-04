<template>
  <div class="advanced-search">
    <el-form :inline="true" :model="searchParams" class="search-form" @submit.prevent="handleSearch">
      <el-form-item label="角色名称">
        <el-input v-model="searchParams.roleName" placeholder="请输入角色名称" clearable />
      </el-form-item>
      <el-form-item label="角色标识">
        <el-input v-model="searchParams.roleKey" placeholder="请输入角色标识" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchParams.status" placeholder="请选择状态" clearable>
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="数据权限">
        <el-select v-model="searchParams.dataScope" placeholder="请选择数据权限" clearable>
          <el-option label="全部" :value="1" />
          <el-option label="自定义" :value="2" />
          <el-option label="本部门" :value="3" />
          <el-option label="部门及以下" :value="4" />
          <el-option label="仅本人" :value="5" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import type { RoleQueryParams } from '@/types/role'

// 定义扩展的查询参数接口
interface ExtendedRoleQueryParams extends RoleQueryParams {
  dataScope?: number
  startDate?: string
  endDate?: string
}

// 定义Props和Emits
const emit = defineEmits<{
  (e: 'search', params: ExtendedRoleQueryParams): void
  (e: 'reset'): void
}>()

// 日期范围
const dateRange = ref<[string, string] | null>(null)

// 搜索参数
const searchParams = reactive<ExtendedRoleQueryParams>({
  roleName: '',
  roleKey: '',
  status: undefined,
  dataScope: undefined,
  startDate: undefined,
  endDate: undefined,
  page: 1,
  pageSize: 10
})

// 监听日期变化
watch(dateRange, (newVal) => {
  if (newVal) {
    searchParams.startDate = newVal[0]
    searchParams.endDate = newVal[1]
  } else {
    searchParams.startDate = undefined
    searchParams.endDate = undefined
  }
})

// 搜索
const handleSearch = () => {
  emit('search', { ...searchParams })
}

// 重置
const handleReset = () => {
  // 重置搜索参数
  searchParams.roleName = ''
  searchParams.roleKey = ''
  searchParams.status = undefined
  searchParams.dataScope = undefined
  dateRange.value = null
  searchParams.startDate = undefined
  searchParams.endDate = undefined

  // 触发重置事件
  emit('reset')
}
</script>

<style lang="scss" scoped>
.advanced-search {
  margin-bottom: 20px;

  .search-form {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
