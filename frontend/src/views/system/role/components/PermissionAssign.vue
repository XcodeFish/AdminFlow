<template>
  <el-dialog title="分配权限" v-model="dialogVisible" width="600px" destroy-on-close @closed="handleDialogClosed">
    <div v-loading="loading">
      <el-alert type="info" :closable="false" class="mb-4">
        <p>请勾选需要授权的权限：</p>
        <p>1. 菜单类型的权限控制显示的页面</p>
        <p>2. 操作类型的权限控制页面上的按钮等操作</p>
      </el-alert>

      <div class="permission-tree-container">
        <el-tree ref="permissionTreeRef" :data="permissionTree" show-checkbox node-key="permKey" :props="treeProps"
          :default-checked-keys="checkedPermKeys" :highlight-current="true" :check-strictly="false"
          :expand-on-click-node="false" @check="handleTreeCheck">
          <template #default="{ node, data }">
            <div class="custom-tree-node">
              <span>{{ data.permName }}</span>
              <el-tag size="small" :type="getPermTypeTag(data.permType)">
                {{ getPermTypeName(data.permType) }}
              </el-tag>
            </div>
          </template>
        </el-tree>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="loading">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import { ElMessage, ElTree } from 'element-plus'
import type { Permission } from '@/types/permission'
import useRolePermission from '../hooks/useRolePermission'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  roleId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'success'): void
}>()

// 弹窗显示控制
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 角色ID
const currentRoleId = ref<string | null>(props.roleId || null)

// 树形引用
const permissionTreeRef = ref<InstanceType<typeof ElTree>>()

// 树形配置
const treeProps = {
  children: 'children',
  label: 'permName'
}

// 使用权限分配Hook
const {
  permissionTree,
  checkedPermKeys,
  loading,
  loadPermissionData,
  saveRolePermissions,
  getPermTypeName
} = useRolePermission(currentRoleId)

console.log('checkedPermKeys', checkedPermKeys.value)



// 权限类型对应的Tag类型
const getPermTypeTag = (type: number) => {
  switch (type) {
    case 0: return ''       // 菜单 - 默认
    case 1: return 'success' // 操作 - 绿色
    case 2: return 'warning' // 数据 - 黄色
    default: return 'info'   // 未知 - 灰色
  }
}

// 监听roleId变化
watch(() => props.roleId, (newVal) => {
  currentRoleId.value = newVal || null
  if (newVal && dialogVisible.value) {
    loadPermissionData()
  }
}, { immediate: true })

// 监听visible变化
watch(() => props.visible, async (newVal) => {
  if (newVal && currentRoleId.value) {
    await loadPermissionData()
    // 确保树组件已加载完成
    nextTick(() => {
      if (permissionTreeRef.value) {
        permissionTreeRef.value.setCheckedKeys(checkedPermKeys.value)
      }
    })
    console.log('加载后的checkedPermKeys', checkedPermKeys.value)
  }
})

// 树形选择事件
const handleTreeCheck = () => {
  // 使用tree组件获取当前选中的节点
  if (permissionTreeRef.value) {
    checkedPermKeys.value = permissionTreeRef.value.getCheckedKeys() as string[]
  }
}

// 保存权限分配
const handleSave = async () => {
  const success = await saveRolePermissions()
  if (success) {
    dialogVisible.value = false
    emit('success')
  }
}

// 弹窗关闭时重置
const handleDialogClosed = () => {
  checkedPermKeys.value = []
}
</script>

<style lang="scss" scoped>
.permission-tree-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  .el-tag {
    margin-left: 8px;
  }
}
</style>
