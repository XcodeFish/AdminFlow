import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { createDept, updateDept } from '@/api/modules/dept'
import type { Department, CreateDeptParams, UpdateDeptParams } from '@/types/dept'
import { DeptStatus } from '@/types/dept'
import { showSuccess, showError } from '@/utils/message'

export default function useDeptForm(onSuccess: () => void, fetchDeptTree: () => Promise<void>) {
  // 对话框可见性
  const dialogVisible = ref(false)

  // 表单引用
  // const formRef = ref<FormInstance>()
  const deptFormRef = ref()

  // 当前编辑的部门
  const currentDept = ref<Department | null>(null)

  // 表单数据
  const formData = reactive<CreateDeptParams>({
    deptName: '',
    parentId: null,
    orderNum: 0,
    leader: '',
    phone: '',
    email: '',
    status: DeptStatus.ENABLED
  })

  // 对话框标题
  const dialogTitle = computed(() => (currentDept.value ? '编辑部门' : '新增部门'))

  // 表单验证规则
  const rules = reactive<FormRules>({
    deptName: [
      { required: true, message: '部门名称不能为空', trigger: 'blur' },
      { max: 50, message: '部门名称长度不能超过50个字符', trigger: 'blur' }
    ],
    orderNum: [
      { required: true, message: '显示顺序不能为空', trigger: 'blur' },
      { type: 'number', min: 0, max: 999, message: '显示顺序必须在0-999之间', trigger: 'blur' }
    ],
    phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }],
    email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }]
  })

  // 打开新增部门对话框
  const openAddDialog = (parentId?: string) => {
    currentDept.value = null
    resetForm()

    // 设置父部门ID，如果传入了parentId则使用，否则默认为null
    formData.parentId = parentId || null

    dialogVisible.value = true
  }

  // 打开编辑部门对话框
  const openEditDialog = (dept: Department) => {
    currentDept.value = dept
    resetForm()

    // 填充表单数据
    formData.deptName = dept.deptName
    formData.parentId = dept.parentId
    formData.orderNum = dept.orderNum
    formData.leader = dept.leader
    formData.phone = dept.phone
    formData.email = dept.email
    formData.status = dept.status

    dialogVisible.value = true
  }

  // 重置表单
  const resetForm = () => {
    if (deptFormRef.value?.formRef) {
      deptFormRef.value.formRef.resetFields()
    }

    formData.deptName = ''
    formData.parentId = null
    formData.orderNum = 0
    formData.leader = ''
    formData.phone = ''
    formData.email = ''
    formData.status = DeptStatus.ENABLED
  }

  // 关闭对话框
  const closeDialog = () => {
    dialogVisible.value = false
    resetForm()
  }

  // 提交表单
  const submitForm = async () => {
    console.log('submitForm', formData)
    const formRef = deptFormRef.value?.formRef
    if (!formRef) return

    await formRef.validate(async (valid: boolean) => {
      console.log('validate', valid)
      if (!valid) return

      try {
        if (currentDept.value) {
          console.log('编辑部门', formData)
          // 编辑部门
          const updateParams: UpdateDeptParams = { ...formData }
          await updateDept(currentDept.value.id, updateParams)
          showSuccess('更新部门成功')
        } else {
          console.log('新增部门', formData)
          // 新增部门
          await createDept(formData)
          showSuccess('新增部门成功')
        }

        closeDialog()
        await fetchDeptTree() // 刷新部门树
        onSuccess() // 执行成功回调
      } catch (error) {
        console.error('提交部门表单失败:', error)
        showError('提交部门表单失败')
      }
    })
  }

  return {
    dialogVisible,
    deptFormRef,
    formData,
    rules,
    dialogTitle,
    openAddDialog,
    openEditDialog,
    closeDialog,
    submitForm
  }
}
