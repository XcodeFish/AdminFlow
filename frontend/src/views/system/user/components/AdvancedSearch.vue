<template>
  <el-drawer v-model="drawerVisible" title="高级筛选" direction="rtl" size="400px">
    <el-form :model="formData" label-width="80px">
      <el-form-item label="用户名">
        <el-input v-model="formData.username" placeholder="请输入用户名" />
      </el-form-item>

      <el-form-item label="真实姓名">
        <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
      </el-form-item>

      <el-form-item label="手机号">
        <el-input v-model="formData.phone" placeholder="请输入手机号" />
      </el-form-item>

      <el-form-item label="邮箱">
        <el-input v-model="formData.email" placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item label="状态">
        <el-select v-model="formData.status" placeholder="请选择状态" clearable style="width: 100%">
          <!-- <el-option label="全部" :value="undefined" /> -->
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>

      <el-form-item label="角色">
        <el-select v-model="formData.roleId" placeholder="请选择角色" clearable style="width: 100%">
          <!-- <el-option label="全部" :value="undefined" /> -->
          <el-option v-for="role in roleOptions" :key="role.id" :label="role.roleName" :value="role.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="部门">
        <el-tree-select v-model="formData.deptId" :data="deptOptions" node-key="id" placeholder="请选择部门"
          :props="{ label: 'deptName', children: 'children' }" clearable check-strictly style="width: 100%" />
      </el-form-item>

      <el-form-item label="创建时间">
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" style="width: 100%" value-format="YYYY-MM-DD" />
      </el-form-item>
    </el-form>

    <div class="flex justify-end gap-2 mt-4">
      <el-button @click="handleReset">重置</el-button>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch } from 'vue'
import type { UserQueryParams, Role } from '@/types/user'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  searchParams: {
    type: Object as () => UserQueryParams,
    default: () => ({})
  },
  roleOptions: {
    type: Array as () => Role[],
    default: () => []
  }
})

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'search', params: UserQueryParams): void
}>()

// 部门选项 - 模拟数据，实际项目中应该从API获取
const deptOptions = ref([
  {
    id: 1, deptName: '总公司', children: [
      { id: 2, deptName: '研发部' },
      { id: 3, deptName: '市场部' },
      { id: 4, deptName: '运营部' }
    ]
  }
])

// 日期范围
const dateRange = ref<[string, string] | []>([])

// 表单数据
const formData = reactive<UserQueryParams>({
  username: undefined,
  realName: undefined,
  phone: undefined,
  email: undefined,
  status: undefined,
  deptId: undefined,
  roleId: undefined
})

// 弹窗可见性
const drawerVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 监听props.searchParams变化，同步到本地表单
watch(() => props.searchParams, (newParams) => {
  if (newParams) {
    Object.assign(formData, newParams)

    // 日期范围处理
    const params = newParams as UserQueryParams & { startTime?: string; endTime?: string }
    if (params.startTime && params.endTime) {
      dateRange.value = [params.startTime, params.endTime]
    } else {
      dateRange.value = []
    }
  }
}, { deep: true, immediate: true })

// 搜索
const handleSearch = () => {
  const params = { ...formData } as UserQueryParams & {
    startTime?: string
    endTime?: string
  }

  // 处理日期范围
  if (dateRange.value && dateRange.value.length === 2) {
    params.startTime = dateRange.value[0]
    params.endTime = dateRange.value[1]
  } else {
    params.startTime = undefined
    params.endTime = undefined
  }

  emit('search', params)
  drawerVisible.value = false
}

// 重置
const handleReset = () => {
  Object.keys(formData).forEach(key => {
    // @ts-ignore
    formData[key] = undefined
  })

  dateRange.value = []

  // 重置后立即搜索
  handleSearch()
}
</script>
