<template>
  <el-dialog v-model="dialogVisible" title="用户详情" width="500px" destroy-on-close>
    <div v-loading="loading">
      <el-descriptions v-if="userInfo" :column="1" border>
        <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ userInfo.realName }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ userInfo.nickname }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ userInfo.phone }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ userInfo.email }}</el-descriptions-item>
        <el-descriptions-item label="角色">
          <el-tag v-for="role in userInfo.roles" :key="role.id" :type="role.roleKey === 'admin' ? 'danger' : 'info'"
            size="small" class="mr-1">
            {{ role.roleName }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="部门">{{ deptName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="userInfo.status === 1 ? 'success' : 'info'">
            {{ userInfo.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDate(userInfo.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="最后登录">
          {{ formatDate(userInfo.lastLoginTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="备注">{{ userInfo.remark || '-' }}</el-descriptions-item>
      </el-descriptions>

      <div v-else class="text-center py-4 text-gray-500">暂无用户信息</div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { getUserById } from '@/api/modules/user'
import { formatDate } from '@/utils/format'
import type { User } from '@/types/user'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  userId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
}>()

// 弹窗显示控制
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 用户数据
const userInfo = ref<User | null>(null)
const loading = ref(false)

// 部门名称
const deptName = computed(() => {
  // 简单示例，实际项目中可能需要从部门列表中查找
  const deptMap: Record<number, string> = {
    1: '总公司',
    2: '研发部',
    3: '市场部',
    4: '运营部'
  }

  return userInfo.value?.deptId ? deptMap[userInfo.value.deptId] || '-' : '-'
})

// 监听userId变化获取用户信息
const unwatchUser = watch(
  () => [props.userId, props.visible],
  (newValues) => {
    const [id, visible] = newValues
    if (typeof id === 'string' && id && visible) {
      fetchUserInfo(id)
    }
  },
  { immediate: true }
)

// 获取用户信息
const fetchUserInfo = async (id: string) => {
  loading.value = true
  try {
    const res = await getUserById(id)
    userInfo.value = res.data
  } catch (error) {
    console.error('获取用户详情失败:', error)
    userInfo.value = null
  } finally {
    loading.value = false
  }
}
</script>
