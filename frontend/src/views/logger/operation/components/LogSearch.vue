<template>
  <div class="log-search">
    <el-form :model="searchForm" label-width="80px" inline>
      <el-form-item label="用户名">
        <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
      </el-form-item>
      <el-form-item label="操作类型">
        <el-select v-model="searchForm.operationType" placeholder="请选择操作类型" clearable>
          <el-option v-for="type in operationTypes" :key="type.value" :label="type.label" :value="type.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作模块">
        <el-input v-model="searchForm.module" placeholder="请输入操作模块" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
          <el-option :value="1" label="成功" />
          <el-option :value="0" label="失败" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作时间">
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD HH:mm:ss" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { OperationType } from '@/types/logger'

// 定义操作类型选项
const operationTypes = [
  { value: OperationType.LOGIN, label: '登录' },
  { value: OperationType.LOGOUT, label: '登出' },
  { value: OperationType.INSERT, label: '新增' },
  { value: OperationType.UPDATE, label: '修改' },
  { value: OperationType.DELETE, label: '删除' },
  { value: OperationType.EXPORT, label: '导出' },
  { value: OperationType.IMPORT, label: '导入' },
  { value: OperationType.OTHER, label: '其他' }
]

// 搜索表单
const searchForm = reactive({
  username: '',
  operationType: '',
  module: '',
  status: undefined as number | undefined
})

// 日期范围 - 使用any类型绕过类型检查问题
const dateRange = ref<any>(null)

// 向父组件传递更新的搜索参数
const emit = defineEmits(['search', 'reset'])

// 搜索操作
const handleSearch = () => {
  const params = {
    ...searchForm,
    startTime: dateRange.value ? dateRange.value[0] : undefined,
    endTime: dateRange.value ? dateRange.value[1] : undefined
  }
  emit('search', params)
}

// 重置操作
const handleReset = () => {
  // 重置表单
  searchForm.username = ''
  searchForm.operationType = ''
  searchForm.module = ''
  searchForm.status = undefined
  dateRange.value = null

  // 通知父组件
  emit('reset')
}
</script>

<style lang="scss" scoped>
.log-search {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
}
</style>
