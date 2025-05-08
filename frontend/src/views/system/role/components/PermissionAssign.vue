<template>
  <el-dialog title="分配权限" v-model="dialogVisible" width="600px" destroy-on-close @closed="handleDialogClosed"
    @open="handleDialogOpen">
    <div v-loading="loading">
      <el-alert type="info" :closable="false" class="mb-4">
        <p>请勾选需要授权的权限：</p>
        <p>1. 菜单类型的权限控制显示的页面</p>
        <p>2. 操作类型的权限控制页面上的按钮等操作</p>
      </el-alert>

      <div class="permission-tree-container">
        <!-- 条件渲染，仅在数据加载完成后渲染树 -->
        <template v-if="isDataReady">
          <el-tree ref="permissionTreeRef" :data="permissionTreeData" show-checkbox node-key="permKey"
            :props="treeProps" :highlight-current="true" :check-strictly="false" :expand-on-click-node="false"
            @check="handleTreeCheck">
            <template #default="{ node, data }">
              <div class="custom-tree-node">
                <span>{{ data.permName }}</span>
                <el-tag size="small" :type="getTagType(data.permType)">
                  {{ getTypeName(data.permType) }}
                </el-tag>
              </div>
            </template>
          </el-tree>
        </template>
        <el-empty v-else description="正在加载权限数据..."></el-empty>
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
import { ref, computed, nextTick, onMounted } from 'vue'
import { ElMessage, ElTree, ElEmpty } from 'element-plus'
import type { Permission } from '@/types/permission'

// 角色权限API
import { assignRolePermissions, getRolePermissions } from '@/api/modules/role'
import { getPermissionTree } from '@/api/modules/permission'

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

// ======== 状态管理 ========
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const loading = ref(false)
const permissionTreeRef = ref<InstanceType<typeof ElTree> | null>(null)
const permissionTreeData = ref<Permission[]>([])
const selectedPermKeys = ref<string[]>([])
const isDataReady = ref(false) // 新增：控制树渲染的状态标志

// 树节点配置
const treeProps = {
  children: 'children',
  label: 'permName'
}

// ======== 辅助函数 ========
// 权限类型对应的Tag类型
const getTagType = (type: number) => {
  switch (type) {
    case 0: return 'info' as const      // 菜单
    case 1: return 'success' as const   // 操作
    case 2: return 'warning' as const   // 数据
    default: return 'info' as const     // 默认
  }
}

// 权限类型名称
const getTypeName = (type: number) => {
  switch (type) {
    case 0: return '菜单'
    case 1: return '操作'
    case 2: return '数据'
    default: return '未知'
  }
}

// ======== 数据加载函数 ========
// 加载权限数据，分离为两个独立函数
const loadAllPermissions = async () => {
  try {
    const res = await getPermissionTree()
    if (res.code === 200) {
      permissionTreeData.value = res.data || []
    } else {
      ElMessage.error('获取权限树失败')
      permissionTreeData.value = []
    }
    return true
  } catch (error) {
    console.error('加载权限树失败:', error)
    ElMessage.error('获取权限树失败')
    permissionTreeData.value = []
    return false
  }
}

// 加载角色已有权限
const loadRolePermissions = async (roleId: string) => {
  if (!roleId) return []

  try {
    const res = await getRolePermissions(roleId)
    if (res.code === 200 && Array.isArray(res.data)) {
      return res.data.map(perm => perm.permKey) || []
    }
    return []
  } catch (error) {
    console.error('加载角色权限失败:', error)
    return []
  }
}

// ======== 初始化加载函数 ========
// 关键变更：创建一个单独的初始化函数
const initializePermissions = async () => {
  if (!props.roleId) return

  loading.value = true
  isDataReady.value = false

  try {
    // 1. 加载所有权限树
    await loadAllPermissions()

    // 2. 加载角色已有权限
    selectedPermKeys.value = await loadRolePermissions(props.roleId)

    // 3. 标记数据准备完毕
    isDataReady.value = true

    // 4. 等待下一个渲染周期
    await nextTick()

    // 5. 再等待一小段时间确保树组件已完全渲染
    setTimeout(() => {
      if (permissionTreeRef.value && selectedPermKeys.value.length > 0) {
        try {
          // 仅在有选中键和树引用存在时设置选中状态
          permissionTreeRef.value.setCheckedKeys(selectedPermKeys.value)
        } catch (err) {
          console.error('设置选中节点失败:', err)
        }
      }
    }, 200)
  } catch (error) {
    console.error('初始化权限数据失败:', error)
    ElMessage.error('初始化权限数据失败')
  } finally {
    loading.value = false
  }
}

// ======== 事件处理函数 ========
// 处理对话框打开事件
const handleDialogOpen = () => {
  // 当对话框打开时初始化数据
  initializePermissions()
}

// 树节点选择事件
const handleTreeCheck = () => {
  if (!permissionTreeRef.value) return

  try {
    const keys = permissionTreeRef.value.getCheckedKeys()
    selectedPermKeys.value = keys as string[]
  } catch (err) {
    console.error('获取选中节点失败:', err)
  }
}

// 保存权限
const handleSave = async () => {
  if (!props.roleId) return

  loading.value = true

  try {
    const res = await assignRolePermissions(props.roleId, {
      permKeys: selectedPermKeys.value || []
    })

    if (res.code === 0) {
      ElMessage.success('权限分配成功')
      dialogVisible.value = false
      emit('success')
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    console.error('保存权限分配失败:', error)
    ElMessage.error('保存权限分配失败')
  } finally {
    loading.value = false
  }
}

// 对话框关闭处理
const handleDialogClosed = () => {
  // 重置状态
  isDataReady.value = false
  selectedPermKeys.value = []
  permissionTreeData.value = []
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
