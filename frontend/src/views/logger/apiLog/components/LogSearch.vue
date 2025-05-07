<template>
  <div class="api-log-search">
    <el-form :model="searchForm" ref="formRef" label-width="80px" class="search-form" @keyup.enter="handleSearch">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="请求URL">
            <el-input v-model="searchForm.requestUrl" placeholder="请输入请求URL" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="请求方法">
            <el-select v-model="searchForm.requestMethod" placeholder="请选择请求方法" clearable style="width: 100%">
              <el-option label="GET" value="GET" />
              <el-option label="POST" value="POST" />
              <el-option label="PUT" value="PUT" />
              <el-option label="DELETE" value="DELETE" />
              <el-option label="PATCH" value="PATCH" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="状态码">
            <el-input v-model="searchForm.status" placeholder="请输入状态码" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="错误级别">
            <el-select v-model="searchForm.errorLevel" placeholder="请选择错误级别" clearable style="width: 100%">
              <el-option label="信息" value="INFO" />
              <el-option label="警告" value="WARN" />
              <el-option label="错误" value="ERROR" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="最小耗时">
            <el-input-number v-model="searchForm.minDuration" placeholder="最小耗时(ms)" clearable :min="0"
              style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="时间范围">
            <el-date-picker v-model="dateRange" type="datetimerange" range-separator="至" start-placeholder="开始时间"
              end-placeholder="结束时间" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="6" class="search-buttons">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import type { ApiLogQueryParams } from '@/types/logger'

const emit = defineEmits<{
  (e: 'search', params: ApiLogQueryParams): void
  (e: 'reset'): void
}>()

const formRef = ref<FormInstance>()
const dateRange = ref<any>(null)

// 搜索表单数据
const searchForm = reactive<ApiLogQueryParams>({
  requestUrl: '',
  requestMethod: '',
  status: undefined,
  errorLevel: '',
  minDuration: undefined,
  startTime: '',
  endTime: ''
})

// 监听日期范围变化
watch(dateRange, (val) => {
  if (val && val.length === 2) {
    searchForm.startTime = val[0]
    searchForm.endTime = val[1]
  } else {
    searchForm.startTime = ''
    searchForm.endTime = ''
  }
})

// 提交搜索
const handleSearch = () => {
  emit('search', { ...searchForm })
}

// 重置搜索条件
const handleReset = () => {
  formRef.value?.resetFields()
  dateRange.value = null
  Object.keys(searchForm).forEach(key => {
    (searchForm as any)[key] = key === 'status' || key === 'minDuration' ? undefined : ''
  })
  emit('reset')
}
</script>

<style lang="scss" scoped>
.api-log-search {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
}

.search-buttons {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding-top: 0;
}
</style>
