<template>
  <el-dialog :title="title" v-model="dialogVisible" width="580px" :close-on-click-modal="false"
    :before-close="handleClose" append-to-body>
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="上级菜单">
        <TreeSelect :modelValue="formData.parentId === undefined ? null : formData.parentId"
          @update:modelValue="(val) => formData.parentId = val" :data="filteredMenuOptions" placeholder="选择上级菜单"
          labelKey="menuName" valueKey="id" rootLabel="顶级菜单" :rootValue="null" :showRoot="true" />
      </el-form-item>

      <el-form-item label="菜单类型" required>
        <el-radio-group v-model="formData.menuType"
          @change="(val: any) => handleMenuTypeChange(val as 'M' | 'C' | 'F')">
          <el-radio value="M">目录</el-radio>
          <el-radio value="C">菜单</el-radio>
          <el-radio value="F">按钮</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="菜单名称" prop="menuName">
        <el-input v-model="formData.menuName" placeholder="请输入菜单名称" />
      </el-form-item>

      <el-form-item v-if="formData.menuType !== 'F'" label="菜单图标" prop="icon">
        <IconSelect :modelValue="formData.icon === undefined ? null : formData.icon"
          @update:modelValue="(val) => formData.icon = val" />
      </el-form-item>

      <!-- 图标预览 -->
      <el-form-item v-if="formData.menuType !== 'F' && formData.icon" label="图标预览">
        <div class="icon-preview">
          <span v-if="isIconify(formData.icon)">
            <Icon :icon="formData.icon" />
          </span>
          <el-icon v-else>
            <component :is="formData.icon" />
          </el-icon>
        </div>
      </el-form-item>

      <el-form-item v-if="formData.menuType !== 'F'" label="排序" prop="orderNum">
        <el-input-number v-model="formData.orderNum" :min="0" :max="999" controls-position="right" />
      </el-form-item>

      <el-form-item v-if="formData.menuType !== 'F'" label="路由地址" prop="path">
        <el-input v-model="formData.path" placeholder="请输入路由地址" />
      </el-form-item>

      <el-form-item v-if="formData.menuType === 'C'" label="组件路径" prop="component">
        <el-input v-model="formData.component" placeholder="请输入组件路径" />
      </el-form-item>

      <el-form-item v-if="formData.menuType !== 'F'" label="外链地址">
        <el-radio-group v-model="formData.isExternal">
          <el-radio :value="0">否</el-radio>
          <el-radio :value="1">是</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="formData.menuType === 'C'" label="路由参数">
        <el-input v-model="formData.query" placeholder="请输入路由参数" maxlength="128" />
      </el-form-item>

      <el-form-item v-if="formData.menuType === 'C'" label="是否缓存">
        <el-radio-group v-model="formData.isCache">
          <el-radio :value="0">否</el-radio>
          <el-radio :value="1">是</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="formData.menuType !== 'F'" label="显示状态">
        <el-radio-group v-model="formData.isVisible">
          <el-radio :value="1">显示</el-radio>
          <el-radio :value="0">隐藏</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="菜单状态">
        <el-radio-group v-model="formData.status">
          <el-radio :value="1">正常</el-radio>
          <el-radio :value="0">停用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="权限标识" prop="perms">
        <el-input v-model="formData.perms" placeholder="请输入权限标识" maxlength="100" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入备注" maxlength="100" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { createMenu, updateMenu, getMenuTree } from '@/api/modules/menu'
import type { MenuItem, MenuTreeNode, CreateMenuParams, UpdateMenuParams } from '@/types/menu'
import TreeSelect from '@/components/common/TreeSelect.vue'
import IconSelect from '@/components/common/IconSelect.vue'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  visible: boolean
  menu: MenuItem | null
  parentId: string | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'success'): void
}>()

// 表单引用
const formRef = ref<FormInstance>()

// 菜单选项
const menuOptions = ref<MenuTreeNode[]>([])

// 对话框显示状态
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 对话框标题
const title = computed(() => {
  return props.menu ? '编辑菜单' : '新增菜单'
})

// 表单数据
const formData = reactive<CreateMenuParams>({
  menuName: '',
  parentId: props.parentId ?? '',
  orderNum: 0,
  path: '',
  component: '',
  query: '',
  isExternal: 0,
  isCache: 0,
  menuType: 'M',
  isVisible: 1,
  status: 1,
  perms: '',
  icon: null,
  remark: ''
})

// 表单验证规则
const rules = reactive<FormRules>({
  menuName: [
    { required: true, message: '菜单名称不能为空', trigger: 'blur' }
  ],
  path: [
    { required: true, message: '路由地址不能为空', trigger: 'blur' }
  ],
  orderNum: [
    { required: true, message: '菜单顺序不能为空', trigger: 'change' }
  ],
  component: [
    {
      required: true,
      message: '组件路径不能为空',
      trigger: 'blur',
      // 仅当菜单类型为C(菜单)时验证
      validator: (rule, value, callback) => {
        if (formData.menuType === 'C' && !value) {
          callback(new Error('组件路径不能为空'))
        } else {
          callback()
        }
      }
    }
  ],
  perms: [
    {
      validator: (rule, value, callback) => {
        if (formData.menuType !== 'M' && !value) {
          callback(new Error('权限标识不能为空'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 监听菜单数据变化，更新表单
watch(() => props.menu, (val) => {
  if (val) {
    // 编辑模式，填充表单数据
    Object.keys(formData).forEach(key => {
      const k = key as keyof typeof formData
      const menuKey = key as keyof MenuItem
      if (val[menuKey] !== undefined) {
        (formData[k] as any) = val[menuKey]
      }
    })
  } else {
    // 新增模式，重置表单
    formRef.value?.resetFields()
    formData.menuType = 'M'
    formData.parentId = props.parentId ?? ''
    formData.orderNum = 0
    formData.isExternal = 0
    formData.isCache = 0
    formData.isVisible = 1
    formData.status = 1
  }
}, { immediate: true })

// 菜单类型变更处理
const handleMenuTypeChange = (value: 'M' | 'C' | 'F') => {
  if (value === 'F') {
    formData.path = ''
    formData.component = ''
    formData.isExternal = 0
    formData.isCache = 0
  } else if (value === 'M') {
    formData.component = ''
  }
}

// 获取菜单树
const fetchMenuTree = async () => {
  try {
    const { data } = await getMenuTree()
    console.log('获取菜单树成功', data)

    menuOptions.value = data || [] // 确保即使返回空值也能正确处理
  } catch (error) {
    console.error('获取菜单树失败', error)
    menuOptions.value = [] // 发生错误时初始化为空数组
  }
}

// 表单提交
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      if (props.menu) {
        // 更新菜单
        const updateData: UpdateMenuParams = {
          ...formData
        }
        await updateMenu(props.menu.id, updateData)
        ElMessage.success('更新成功')
      } else {
        // 新增菜单
        await createMenu(formData)
        ElMessage.success('新增成功')
      }

      dialogVisible.value = false
      emit('success')
    } catch (error) {
      console.error('保存菜单失败', error)
      ElMessage.error('操作失败，请重试')
    }
  })
}

const handleCancel = () => {
  try {
    // 重置表单
    formRef.value?.resetFields()
    // 关闭对话框
    dialogVisible.value = false
  } catch (error) {
    console.error('关闭对话框失败', error)
    // 强制关闭
    emit('update:visible', false)
  }
}

// 对话框关闭前的处理
const handleClose = (done: () => void) => {
  try {
    formRef.value?.resetFields()
    done()
  } catch (error) {
    console.error('关闭对话框失败', error)
    emit('update:visible', false)
  }
}

// 根据选择的菜单类型过滤可选的上级菜单
const filteredMenuOptions = computed(() => {
  if (!menuOptions.value || !menuOptions.value.length) {
    return []
  }

  // 保留顶级菜单选项
  const rootOption = menuOptions.value.find(item => item.id === '0')
  let filteredOptions = rootOption ? [rootOption] : []

  const currentId = props.menu?.id // 获取当前编辑菜单的ID

  if (formData.menuType === 'M') {
    // 目录下可以添加目录，所以可选的上级菜单是目录
    const directoryOptions = menuOptions.value.filter(item =>
      item.menuType === 'M' && item.id !== currentId
    )
    filteredOptions = [...filteredOptions, ...directoryOptions]
  } else if (formData.menuType === 'C') {
    // 菜单下可以添加按钮，所以可选的上级菜单是目录
    const directoryOptions = menuOptions.value.filter(item => item.menuType === 'M')
    filteredOptions = [...filteredOptions, ...directoryOptions]
  } else if (formData.menuType === 'F') {
    // 按钮的上级只能是菜单
    const menuItems = menuOptions.value.filter(item => item.menuType === 'C')
    filteredOptions = [...filteredOptions, ...menuItems]
  }

  return filteredOptions
})

// 判断是否为Iconify图标
const isIconify = (icon: string | null) => {
  return icon ? icon.includes(':') : false
}

onMounted(() => {
  fetchMenuTree()
})
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.icon-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;

  .el-icon,
  svg {
    font-size: 32px;
    color: #409eff;
  }
}
</style>
